export const APP_NAME = 'EventSphere'
export const APP_DESCRIPTION = 'Your premier event management and ticketing platform'

export const ROLES = {
  ATTENDEE: 'attendee',
  ORGANISER: 'organiser',
  ADMIN: 'admin',
} as const

export const EVENT_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

export const TICKET_STATUSES = {
  VALID: 'valid',
  USED: 'used',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

export const STORAGE_BUCKETS = {
  EVENT_BANNERS: 'event-banners',
  EVENT_GALLERY: 'event-gallery',
  SPEAKER_IMAGES: 'speaker-images',
  PROFILE_IMAGES: 'profile-images',
} as const

export const ITEMS_PER_PAGE = 12

export const CATEGORY_ICONS: Record<string, string> = {
  cpu: '💻',
  music: '🎵',
  briefcase: '💼',
  trophy: '🏆',
  palette: '🎨',
  'graduation-cap': '🎓',
  utensils: '🍽️',
  'heart-pulse': '❤️‍🩹',
  'flask-conical': '🔬',
  users: '👥',
  'gamepad-2': '🎮',
  camera: '📷',
  tag: '🏷️',
}

export const CURRENCY = 'INR'
export const CURRENCY_SYMBOL = '₹'

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || ''
