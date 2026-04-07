import VerdictCard from './VerdictCard';
import ModelResultCard from './ModelResultCard';

export default function ResultDisplay({ result }) {
  return (
    <div className="space-y-4">
      {/* Verdict Summary */}
      <VerdictCard result={result} />

      {/* Individual Model Results */}
      {result.models && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500">Model Details</h3>
          {/* Stack on mobile, 3-column grid on desktop */}
          <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-3">
            {result.models.sbi && (
              <ModelResultCard modelKey="sbi" modelResult={result.models.sbi} />
            )}
            {result.models.distildire && (
              <ModelResultCard modelKey="distildire" modelResult={result.models.distildire} />
            )}
            {result.models.chatgpt && (
              <ModelResultCard modelKey="chatgpt" modelResult={result.models.chatgpt} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
