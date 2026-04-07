from app.models.chatgpt_vision import ChatGPTVision
from app.models.sbi_model import SBIModel
from app.models.distildire_model import DistilDIREModel
from app.core.config import settings
import os

class DetectionService:
    def __init__(self):
        print("Initializing Detection Service...")

        # Initialize ChatGPT Vision model
        self.chatgpt_vision = ChatGPTVision(api_key=settings.OPENAI_API_KEY)

        # Initialize SBI and DistilDIRE models
        # Check if models are available before loading
        self.use_sbi = False
        self.use_distildire = False

        try:
            sbi_path = os.path.join(
                os.path.dirname(__file__),
                '../../ml_models/deployment_package/models/sbi'
            )
            if os.path.exists(os.path.join(sbi_path, 'exp003_best_model.pth')):
                self.sbi_model = SBIModel(sbi_path)
                self.use_sbi = True
            else:
                print("⚠ SBI model files not found, using placeholder")
        except Exception as e:
            print(f"⚠ Failed to load SBI model: {e}")

        try:
            distildire_path = os.path.join(
                os.path.dirname(__file__),
                '../../ml_models/deployment_package/models/distildire'
            )
            if os.path.exists(os.path.join(distildire_path, 'v2_best_model.pth')):
                self.distildire_model = DistilDIREModel(distildire_path)
                self.use_distildire = True
            else:
                print("⚠ DistilDIRE model files not found, using placeholder")
        except Exception as e:
            print(f"⚠ Failed to load DistilDIRE model: {e}")

        print(f"✓ Detection Service initialized:")
        print(f"  - SBI: {'Active' if self.use_sbi else 'Placeholder'}")
        print(f"  - DistilDIRE: {'Active' if self.use_distildire else 'Placeholder'}")
        print(f"  - ChatGPT Vision: Active")

    def detect(self, image_bytes: bytes) -> dict:
        """
        Detect deepfake using hybrid approach

        Args:
            image_bytes: Image file bytes

        Returns:
            dict: Detection results with deepfake confidence scores
                - is_fake: True if detected as deepfake, False if real
                - confidence: Deepfake probability (0.0 = definitely real, 1.0 = definitely fake)
                - Each model returns (is_fake, deepfake_confidence)
        """

        # 1. SBI Model
        if self.use_sbi:
            try:
                sbi_is_fake, sbi_confidence = self.sbi_model.predict(image_bytes)
                sbi_status = "active"
            except Exception as e:
                print(f"SBI prediction error: {e}")
                sbi_is_fake, sbi_confidence = False, 0.5
                sbi_status = "error"
        else:
            sbi_is_fake, sbi_confidence = False, 0.5
            sbi_status = "placeholder"

        # 2. DistilDIRE Model
        if self.use_distildire:
            try:
                distildire_is_fake, distildire_confidence = self.distildire_model.predict(image_bytes)
                distildire_status = "active"
            except Exception as e:
                print(f"DistilDIRE prediction error: {e}")
                distildire_is_fake, distildire_confidence = False, 0.5
                distildire_status = "error"
        else:
            distildire_is_fake, distildire_confidence = False, 0.5
            distildire_status = "placeholder"

        # 3. ChatGPT Vision
        try:
            chatgpt_is_fake, chatgpt_confidence = self.chatgpt_vision.verify(image_bytes)
            chatgpt_status = "active"
        except Exception as e:
            print(f"ChatGPT prediction error: {e}")
            chatgpt_is_fake, chatgpt_confidence = False, 0.5
            chatgpt_status = "error"

        # Each model has its own optimal threshold (tuned per-model).
        # Top-level is_fake is true if ANY active model exceeds its threshold.
        is_fake = any([
            sbi_status == "active" and sbi_confidence >= 0.4839,
            distildire_status == "active" and distildire_confidence >= 0.5,
            chatgpt_status == "active" and chatgpt_confidence >= 0.65,
        ])

        return {
            "is_fake": is_fake,
            "models": {
                "sbi": {
                    "is_fake": sbi_is_fake,
                    "confidence": sbi_confidence,
                    "status": sbi_status
                },
                "distildire": {
                    "is_fake": distildire_is_fake,
                    "confidence": distildire_confidence,
                    "status": distildire_status
                },
                "chatgpt": {
                    "is_fake": chatgpt_is_fake,
                    "confidence": chatgpt_confidence,
                    "status": chatgpt_status
                }
            }
        }
