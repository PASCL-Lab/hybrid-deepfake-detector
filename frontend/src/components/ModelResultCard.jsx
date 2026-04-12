import { iconMap } from './icons';
import { MODEL_CONFIG, THRESHOLD } from '../constants/modelConfig';

export default function ModelResultCard({ modelKey, modelResult }) {
  const config = MODEL_CONFIG[modelKey];
  const IconComponent = iconMap[config.icon];

  const confidence = modelResult.confidence;
  const confidencePercent = confidence * 100;
  const isFake = confidencePercent >= (THRESHOLD[modelKey] * 100);
  const isError = modelResult.status === 'error';
  const isPlaceholder = modelResult.status === 'placeholder';

  // Determine badge styling
  let badge;
  if (isError) {
    badge = { text: 'ERROR', bgColor: '#f3f4f6', textColor: '#6b7280' };
  } else if (isPlaceholder) {
    badge = { text: 'N/A', bgColor: '#f3f4f6', textColor: '#6b7280' };
  } else if (isFake) {
    badge = { text: 'FAKE', bgColor: '#FFEBEE', textColor: '#E53935' };
  } else {
    badge = { text: 'REAL', bgColor: '#E8F5E9', textColor: '#43A047' };
  }

  const progressColor = isFake ? '#E53935' : '#43A047';

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        backgroundColor: `${config.accentColor}0D`,
        borderColor: `${config.accentColor}40`
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
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
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {config.resultSubtitle}
            </p>
          </div>
        </div>

        <span
          className="px-2.5 py-1 rounded-md text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: badge.bgColor, color: badge.textColor }}
        >
          {badge.text}
        </span>
      </div>

      {!isPlaceholder && !isError && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500">
              {isFake ? 'Fake Confidence' : 'Real Confidence'}
            </span>
            <span className="font-semibold" style={{ color: progressColor }}>
              {isFake ? confidencePercent.toFixed(1) : (100 - confidencePercent).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${isFake ? confidencePercent : 100 - confidencePercent}%`,
                backgroundColor: progressColor
              }}
            />
          </div>
        </div>
      )}

      {isPlaceholder && (
        <p className="text-xs text-gray-400 mt-3 italic">
          Model not loaded
        </p>
      )}

      {isError && (
        <p className="text-xs text-fake mt-3">
          Analysis failed
        </p>
      )}
    </div>
  );
}
