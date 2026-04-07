import { MODEL_CONFIG } from '../constants/modelConfig';

function StatusRow({ modelKey, status }) {
  const config = MODEL_CONFIG[modelKey];

  const statusDisplay = {
    pending: { text: 'Waiting...', colorClass: 'text-gray-400' },
    running: { text: 'Running...', colorClass: 'text-gray-500', animate: true },
    done: { text: 'Done', colorClass: 'text-real' },
    failed: { text: 'Failed', colorClass: 'text-fake' },
  };

  const { text, colorClass, animate } = statusDisplay[status] || statusDisplay.pending;

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{config.shortTitle}</span>
      <span className={`text-sm font-medium ${colorClass} ${animate ? 'animate-pulse' : ''}`}>
        {text}
      </span>
    </div>
  );
}

export default function LoadingStatus({ modelStatuses }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="divide-y divide-gray-100">
        <StatusRow modelKey="sbi" status={modelStatuses.sbi} />
        <StatusRow modelKey="distildire" status={modelStatuses.distildire} />
        <StatusRow modelKey="chatgpt" status={modelStatuses.chatgpt} />
      </div>
    </div>
  );
}
