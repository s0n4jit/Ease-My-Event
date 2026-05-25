import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ size = 'default', text }: { size?: 'sm' | 'default' | 'lg'; text?: string }) {
  const sizeMap = { sm: 'h-4 w-4', default: 'h-8 w-8', lg: 'h-12 w-12' }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={`${sizeMap[size]} animate-spin text-violet-600`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-violet-200 dark:border-violet-800" />
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-violet-600" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
