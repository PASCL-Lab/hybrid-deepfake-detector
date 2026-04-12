import { iconMap } from './icons';
import { MODEL_CONFIG } from '../constants/modelConfig';

function ModelInfoCard({ modelKey }) {
  const config = MODEL_CONFIG[modelKey];
  const IconComponent = iconMap[config.icon];

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        backgroundColor: `${config.accentColor}0D`,
        borderColor: `${config.accentColor}40`
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${config.accentColor}26` }}
        >
          <IconComponent
            className="w-5 h-5"
            style={{ color: config.accentColor }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-sm"
            style={{ color: config.accentColor }}
          >
            {config.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ModelInfoSection() {
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-0">

      {/* Left: VLM */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Vision Language Model</h2>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Comparative</span>
        </div>
        <div className="flex-1 flex flex-col">
          <ModelInfoCard modelKey="chatgpt" />
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Unlike specialized detectors, VLMs are general-purpose models not optimized for forensic analysis. Their outputs on deepfake detection tasks tend to be inconsistent — contrasting with the deterministic artifact-based approach of the specialized models.
          </p>
        </div>
      </div>

      {/* Center VS */}
      <div className="flex items-center justify-center px-4 py-6 md:py-0">
        <div className="flex flex-col items-center gap-1">
          <div className="hidden md:block w-px bg-gray-200" style={{ height: '40px' }} />
          <span className="text-2xl font-black text-gray-300 tracking-widest select-none">VS</span>
          <div className="hidden md:block w-px bg-gray-200" style={{ height: '40px' }} />
        </div>
      </div>

      {/* Right: Specialized Models */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Artifact-Based Detection</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Specialized Models</span>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <ModelInfoCard modelKey="sbi" />
          <ModelInfoCard modelKey="distildire" />
        </div>
      </div>

    </div>
  );
}
