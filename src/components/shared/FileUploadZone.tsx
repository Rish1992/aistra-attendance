import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { Upload, File, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedFile {
  file: File
  id: string
}

interface FileUploadZoneProps {
  accept?: string
  maxSize?: number
  onUpload: (files: File[]) => void
  multiple?: boolean
  className?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploadZone({
  accept,
  maxSize = 10 * 1024 * 1024,
  onUpload,
  multiple = false,
  className,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const validFiles: File[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.size <= maxSize) {
          validFiles.push(file)
        }
      }

      if (validFiles.length === 0) return

      const newUploaded = validFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }))

      setUploadedFiles((prev) => (multiple ? [...prev, ...newUploaded] : newUploaded))
      onUpload(validFiles)
    },
    [maxSize, multiple, onUpload]
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [handleFiles]
  )

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const acceptHint = accept
    ? accept
        .split(',')
        .map((a) => a.trim().replace('.', '').toUpperCase())
        .join(', ')
    : null

  return (
    <div className={cn('space-y-3', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all text-center',
          isDragOver
            ? 'border-teal-300 bg-teal-50/30'
            : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Upload className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              Click to upload{' '}
              <span className="text-slate-400 font-normal">or drag & drop</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {acceptHint && <span>{acceptHint} files</span>}
              {acceptHint && maxSize && <span> &middot; </span>}
              {maxSize && <span>Max {formatFileSize(maxSize)}</span>}
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2"
            >
              <File className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 truncate">{item.file.name}</p>
                <p className="text-xs text-slate-400">
                  {formatFileSize(item.file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(item.id)
                }}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
