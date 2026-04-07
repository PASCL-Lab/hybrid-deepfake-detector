import { THRESHOLD, MODEL_CONFIG, COLORS } from '../constants/modelConfig';

export default function VerdictCard({ result }) {
  // Collect analysis lines for models that detected manipulation
  const analysisLines = [];

  if (result.models) {
    const { sbi, distildire, chatgpt } = result.models;

    if (sbi && sbi.status !== 'placeholder' && sbi.status !== 'error' && sbi.confidence >= THRESHOLD.sbi) {
      analysisLines.push(`High likelihood of face-swap / reenactment (SBI: ${(sbi.confidence * 100).toFixed(0)}%)`);
    }
    if (distildire && distildire.status !== 'placeholder' && distildire.status !== 'error' && distildire.confidence >= THRESHOLD.distildire) {
      analysisLines.push(`High likelihood of diffusion AI-generated image (DistilDIRE: ${(distildire.confidence * 100).toFixed(0)}%)`);
    }
    if (chatgpt && chatgpt.status !== 'placeholder' && chatgpt.status !== 'error' && chatgpt.confidence >= THRESHOLD.chatgpt) {
      analysisLines.push(`AI manipulation / artifacts detected (GPT Vision: ${(chatgpt.confidence * 100).toFixed(0)}%)`);
    }
  }

  const isFake = analysisLines.length > 0;

  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{
        backgroundColor: isFake ? COLORS.fake.background : COLORS.real.background
      }}
    >
      <h2
        className="text-xl font-bold"
        style={{ color: isFake ? COLORS.fake.primary : COLORS.real.primary }}
      >
        {isFake ? 'High Chance of Being Fake' : 'Likely Authentic'}
      </h2>

      {isFake && analysisLines.length > 0 && (
        <div className="mt-3 text-left">
          {analysisLines.map((line, index) => (
            <p
              key={index}
              className="text-sm mt-1"
              style={{ color: COLORS.fake.dark }}
            >
              • {line}
            </p>
          ))}
        </div>
      )}

      {!isFake && (
        <p className="text-sm text-gray-500 mt-2">
          No strong evidence of manipulation detected
        </p>
      )}
    </div>
  );
}
