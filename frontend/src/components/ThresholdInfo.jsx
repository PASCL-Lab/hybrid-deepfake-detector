export default function ThresholdInfo() {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">
        Confidence Threshold
      </h3>
      {/* Stack on mobile, side by side on desktop */}
      <div className="space-y-2 md:space-y-0 md:flex md:gap-6">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-fake flex-shrink-0"></span>
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-fake">&ge; 65%</span>
            <span className="ml-2">FAKE — model is confident the image is manipulated</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-real flex-shrink-0"></span>
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-real">&lt; 65%</span>
            <span className="ml-2">REAL — no strong evidence of manipulation detected</span>
          </span>
        </div>
      </div>
    </div>
  );
}
