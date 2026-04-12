import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import ResultDisplay from './components/ResultDisplay'
import ModelInfoSection from './components/ModelInfoSection'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-100">
      {/* max-w-md on mobile, max-w-4xl on desktop */}
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-5">
          <h1 className="text-2xl font-bold text-gray-900">
            Deepfake Detector
          </h1>
        </header>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
          {/* Image Upload */}
          <ImageUploader
            onResult={setResult}
            loading={loading}
            setLoading={setLoading}
          />

          {/* Show Model Info when no results */}
          {!result && !loading && (
            <ModelInfoSection />
          )}

          {/* Show Results */}
          {result && <ResultDisplay result={result} />}
        </div>

        {/* Footer */}
        <footer className="text-center mt-6 text-xs text-gray-500">
          <p>*Model can make mistakes</p>
        </footer>
      </div>
    </div>
  )
}

export default App
