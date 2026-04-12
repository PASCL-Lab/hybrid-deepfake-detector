import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { detectDeepfake } from '../services/api'
import LoadingStatus from './LoadingStatus'
import CropModal from './CropModal'

export default function ImageUploader({ onResult, loading, setLoading }) {
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [cropSrc, setCropSrc] = useState(null)
  const [cropFileName, setCropFileName] = useState('')
  const [modelStatuses, setModelStatuses] = useState({
    sbi: 'pending',
    distildire: 'pending',
    chatgpt: 'pending'
  })

  // Simulate model-by-model progress (since API returns all at once)
  useEffect(() => {
    if (loading) {
      setModelStatuses({ sbi: 'running', distildire: 'pending', chatgpt: 'pending' })

      const timer1 = setTimeout(() => {
        setModelStatuses(prev => ({ ...prev, sbi: 'done', distildire: 'running' }))
      }, 800)

      const timer2 = setTimeout(() => {
        setModelStatuses(prev => ({ ...prev, distildire: 'done', chatgpt: 'running' }))
      }, 1600)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [loading])

  const runDetection = useCallback(async (file, previewUrl) => {
    setError(null)
    onResult(null)
    setPreview(previewUrl)
    setLoading(true)

    try {
      const result = await detectDeepfake(file)
      setModelStatuses({ sbi: 'done', distildire: 'done', chatgpt: 'done' })
      onResult(result)
    } catch (err) {
      setError('Failed to analyze image. Please try again.')
      setModelStatuses({ sbi: 'failed', distildire: 'failed', chatgpt: 'failed' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [onResult, setLoading])

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    // Show crop modal instead of uploading immediately
    setCropSrc(URL.createObjectURL(file))
    setCropFileName(file.name)
  }, [])

  const handleCropConfirm = useCallback((croppedFile, croppedPreviewUrl) => {
    setCropSrc(null)
    runDetection(croppedFile, croppedPreviewUrl)
  }, [runDetection])

  const handleCropCancel = useCallback(() => {
    setCropSrc(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    disabled: loading
  })

  return (
    <div className="space-y-4">
      {/* Crop Modal */}
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          fileName={cropFileName}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-gray-900 bg-gray-100'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isDragActive ? (
            <p className="text-base text-gray-900 font-medium">Drop the image here</p>
          ) : (
            <div>
              <p className="text-base text-gray-700 font-medium">
                <span className="md:hidden">Tap to select an image</span>
                <span className="hidden md:inline">Drag and drop an image, or click to select</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, JPEG, WEBP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-80 md:max-h-96 object-contain rounded-xl border border-gray-200"
          />
        </div>
      )}

      {/* Loading Status */}
      {loading && <LoadingStatus modelStatuses={modelStatuses} />}

      {/* Error Display */}
      {error && (
        <div className="bg-fake-light border border-fake text-fake-dark px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
