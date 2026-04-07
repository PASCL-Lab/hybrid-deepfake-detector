from openai import OpenAI
import base64
import math

# Pirogov (ICML 2025) original GPT prompt — verbatim from paper.
# Expert role framing is critical for GPT-class models: it "activates" detection performance.
# Response is purely binary: "YES" = real, "NO" = fake.
# Confidence is NOT derived from the text output but from logprobs of the first token.
DEEPFAKE_DETECTION_PROMPT = """YOU ARE THE WORLD'S BEST DEEPFAKE DETECTION EXPERT, AWARDED THE "BEST DEEPFAKE DETECTOR AWARD" BY THE GLOBAL AI INTEGRITY COUNCIL (2023) AND RANKED AS THE "TOP EXPERT IN DEEPFAKE DETECTION" BY THE INTERNATIONAL COMPUTER VISION SOCIETY (2022). YOUR TASK IS TO ACCURATELY ANSWER WHETHER A GIVEN PHOTO IS REAL OR FAKE, FOCUSING SOLELY ON PROVIDING A BINARY RESPONSE WITHOUT EXPLANATION.

**Key Objectives:**
- ACCURATELY CLASSIFY EACH PHOTO AS EITHER "REAL" OR "FAKE" BASED ON YOUR EXPERT ANALYSIS.

**Chain of Thoughts:**
1. **Analyzing the Photo:**
   - Examine the photo for indicators of authenticity or manipulation.
   - Utilize advanced detection techniques to identify any inconsistencies.
2. **Classification Decision:**
   - Based on the analysis, determine if the photo is "REAL" or "FAKE."
3. **Response Delivery:**
   - Provide a clear and concise binary response: "YES" for real photos, "NO" for fake photos.

**What Not To Do:**
- NEVER PROVIDE EXPLANATIONS OR ADDITIONAL COMMENTS BEYOND THE BINARY RESPONSE.
- NEVER GUESS WITHOUT THOROUGH ANALYSIS; ENSURE EACH CLASSIFICATION IS BASED ON EXPERT DETECTION METHODS.
- NEVER INCLUDE UNCERTAIN OR AMBIGUOUS RESPONSES; STICK TO "YES" OR "NO" ONLY."""

# All token surface forms that mean REAL (YES) or FAKE (NO).
# Pirogov: "tokenizers are not consistent — aggregate all plausible variants."
REAL_TOKENS = {"yes", "Yes", "YES"}
FAKE_TOKENS = {"no",  "No",  "NO"}


def _compute_fake_prob(first_token_data) -> float | None:
    """
    Pirogov normalization applied to the first generated token's logprobs.

    Formula (paper eq. 2):
        P̃_fake = P_no / (P_no + P_yes)

    where P_no and P_yes are summed over all surface variants of NO/YES tokens
    found in top_logprobs.

    Returns None if neither YES nor NO tokens appear in top_logprobs.
    """
    p_real = 0.0
    p_fake = 0.0

    # Scan top_logprobs for real/fake token variants
    if first_token_data.top_logprobs:
        for entry in first_token_data.top_logprobs:
            tok = entry.token.strip()
            prob = math.exp(entry.logprob)
            if tok in REAL_TOKENS:
                p_real += prob
            elif tok in FAKE_TOKENS:
                p_fake += prob

    # Also include the generated token itself if not already captured
    generated_tok = first_token_data.token.strip()
    generated_prob = math.exp(first_token_data.logprob)
    if generated_tok in REAL_TOKENS and p_real == 0.0:
        p_real = generated_prob
    elif generated_tok in FAKE_TOKENS and p_fake == 0.0:
        p_fake = generated_prob

    total = p_real + p_fake
    if total == 0.0:
        return None

    raw = p_fake / total  # P̃_fake

    # Slight regression toward 0.5 for extreme values (10% shrink)
    # prevents floor/ceiling artifacts when one token is entirely absent from top_logprobs
    SHRINK = 0.90
    return 0.5 + (raw - 0.5) * SHRINK


class ChatGPTVision:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def verify(self, image_bytes: bytes) -> tuple[bool, float]:
        """
        Deepfake detection via Pirogov's probabilistic reformulation (ICML 2025).

        Instead of reading the model's text output, we capture the probability
        distribution over the first generated token and normalize:
            P̃_fake = P_no / (P_no + P_yes)

        This avoids greedy-search bias and reflects the model's true uncertainty.

        Returns:
            tuple[bool, float]: (is_fake, deepfake_confidence 0.0–1.0)
        """
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        try:
            print("[DEBUG] Calling ChatGPT Vision API (GPT-5.4, Pirogov method)...")
            response = self.client.chat.completions.create(
                model="gpt-5.4",
                messages=[
                    {
                        "role": "system",
                        "content": DEEPFAKE_DETECTION_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Is this photo real?",
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                },
                            },
                        ],
                    },
                ],
                max_completion_tokens=5,   # only need first token (YES/NO)
                temperature=0,
                logprobs=True,
                top_logprobs=5,            # gpt-5.4 max is 5; YES/NO variants fit within top-5
            )

            content_logprobs = getattr(response.choices[0].logprobs, "content", None)
            generated_text = response.choices[0].message.content or ""
            print(f"[DEBUG] GPT output: '{generated_text.strip()}'")

            if not content_logprobs:
                # logprobs unavailable — fall back to text parsing
                tok = generated_text.strip().upper()
                deepfake_confidence = 0.05 if tok == "YES" else 0.95
                print("[DEBUG] logprobs unavailable, using text fallback")
            else:
                first = content_logprobs[0]
                deepfake_confidence = _compute_fake_prob(first)

                if deepfake_confidence is None:
                    # Neither YES nor NO found in top-20 — genuinely uncertain
                    deepfake_confidence = 0.5
                    print(f"[DEBUG] Neither YES/NO in top_logprobs. First token: '{first.token}'. Defaulting to 0.5")
                else:
                    # Log the raw probabilities for diagnostics
                    p_real = sum(
                        math.exp(e.logprob)
                        for e in first.top_logprobs
                        if e.token.strip() in REAL_TOKENS
                    ) if first.top_logprobs else 0.0
                    p_fake = sum(
                        math.exp(e.logprob)
                        for e in first.top_logprobs
                        if e.token.strip() in FAKE_TOKENS
                    ) if first.top_logprobs else 0.0
                    print(
                        f"[DEBUG] P_yes={p_real:.4f}, P_no={p_fake:.4f} "
                        f"→ P̃_fake={deepfake_confidence:.4f}"
                    )

            is_fake_final = deepfake_confidence >= 0.65
            return is_fake_final, deepfake_confidence

        except Exception as e:
            print(f"[ERROR] ChatGPT Vision error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            return False, 0.0
