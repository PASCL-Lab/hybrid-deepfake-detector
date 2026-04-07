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
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-500">Detection Models</h2>
      {/* Stack on mobile, 3-column grid on desktop */}
      <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-3">
        <ModelInfoCard modelKey="sbi" />
        <ModelInfoCard modelKey="distildire" />
        <ModelInfoCard modelKey="chatgpt" />
      </div>
    </div>
  );
}
