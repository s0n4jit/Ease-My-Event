import { useCallback, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { supabase } from '#/lib/supabase'
import { Button } from '#/components/ui/button'

interface FileUploadProps {
  bucket: string
  path: string
  onUpload: (url: string) => void
  accept?: string
  maxSize?: number
  currentUrl?: string | null
  label?: string
}

export function FileUpload({ bucket, path, onUpload, accept = 'image/*', maxSize = 5 * 1024 * 1024, currentUrl, label = 'Upload Image' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${path}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      setPreview(publicUrl)
      onUpload(publicUrl)
    } catch (err) {
      setError('Upload failed. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }, [bucket, path, maxSize, onUpload])

  const handleRemove = () => {
    setPreview(null)
    onUpload('')
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border border-border/50">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-violet-300 transition-colors">
          <div className="flex flex-col items-center gap-2 text-center p-4">
            {uploading ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground/60" />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">PNG, JPG, WebP up to {Math.round(maxSize / 1024 / 1024)}MB</span>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept={accept} onChange={handleUpload} disabled={uploading} />
        </label>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
