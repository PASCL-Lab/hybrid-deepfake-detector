import VerdictCard from './VerdictCard';
import ModelResultCard from './ModelResultCard';

export default function ResultDisplay({ result }) {
  return (
    <div className="space-y-4">
      {/* Verdict Summary */}
      <VerdictCard result={result} />

      {result.models && (
        <div className="flex flex-col md:flex-row items-stretch gap-0">

          {/* Left: VLM */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Vision Language Model</h3>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Comparative</span>
            </div>
            {result.models.chatgpt && (
              <div className="flex-1 flex flex-col">
                <ModelResultCard modelKey="chatgpt" modelResult={result.models.chatgpt} />
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Unlike specialized detectors, VLMs are general-purpose models not optimized for forensic analysis. Their outputs on deepfake detection tasks tend to be inconsistent — contrasting with the deterministic artifact-based approach of the specialized models.
                </p>
              </div>
            )}
          </div>

          {/* Center VS */}
          <div className="flex items-center justify-center px-4 py-6 md:py-0">
            <div className="flex flex-col items-center gap-1">
              <div className="hidden md:block w-px bg-gray-200 flex-1" style={{ height: '40px' }} />
              <span className="text-2xl font-black text-gray-300 tracking-widest select-none">VS</span>
              <div className="hidden md:block w-px bg-gray-200 flex-1" style={{ height: '40px' }} />
            </div>
          </div>

          {/* Right: Specialized Models */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Artifact-Based Detection</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Specialized Models</span>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {result.models.sbi && (
                <ModelResultCard modelKey="sbi" modelResult={result.models.sbi} />
              )}
              {result.models.distildire && (
                <ModelResultCard modelKey="distildire" modelResult={result.models.distildire} />
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
