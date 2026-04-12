import { THRESHOLD, MODEL_CONFIG, COLORS } from '../constants/modelConfig';

export default function VerdictCard({ result }) {
  // Collect analysis lines for models that detected manipulation
  const analysisLines = [];

  if (result.models) {
    const { sbi, distildire } = result.models;

    if (sbi && sbi.status !== 'placeholder' && sbi.status !== 'error' && sbi.confidence >= THRESHOLD.sbi) {
      analysisLines.push(`Face-swap / reenactment blending artifacts detected (SBI: ${(sbi.confidence * 100).toFixed(0)}%)`);
    }
    if (distildire && distildire.status !== 'placeholder' && distildire.status !== 'error' && distildire.confidence >= THRESHOLD.distildire) {
      analysisLines.push(`AI diffusion synthesis patterns detected (DistilDIRE: ${(distildire.confidence * 100).toFixed(0)}%)`);
    }
    // GPT Vision is intentionally excluded from the verdict summary —
    // VLM outputs are shown separately as an experimental signal.
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
        {isFake ? 'Potential Deepfake Artifacts Detected' : 'No Deepfake Artifacts Detected'}
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
          No artifacts or manipulation patterns were flagged by any model
        </p>
      )}
    </div>
  );
}
