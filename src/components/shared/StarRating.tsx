import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizeMap = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }
  const gapMap = { sm: 'gap-0.5', md: 'gap-1', lg: 'gap-1.5' }

  return (
    <div className={`flex items-center ${gapMap[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => !readonly && setHoverValue(0)}
        >
          <Star
            className={`${sizeMap[size]} transition-colors ${
              star <= (hoverValue || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
