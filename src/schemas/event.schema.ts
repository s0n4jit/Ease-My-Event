import { z } from 'zod'

export const eventBasicsSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  category_id: z.string().uuid('Please select a category'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  short_description: z.string().max(300).optional().or(z.literal('')),
  event_type: z.enum(['online', 'offline', 'hybrid']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  tags: z.array(z.string()).optional(),
})

export const eventLocationSchema = z.object({
  venue_name: z.string().optional().or(z.literal('')),
  venue_address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  online_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export const speakerSchema = z.object({
  name: z.string().min(2, 'Speaker name is required'),
  title: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  image_url: z.string().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  twitter_url: z.string().url().optional().or(z.literal('')),
})

export const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name is required'),
  description: z.string().optional().or(z.literal('')),
  price: z.number().min(0, 'Price must be 0 or more'),
  quantity: z.number().int().min(1, 'Must have at least 1 ticket'),
  sale_start: z.string().optional().or(z.literal('')),
  sale_end: z.string().optional().or(z.literal('')),
})

export const discountCodeSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20).transform(v => v.toUpperCase()),
  discount_type: z.enum(['percentage', 'flat']),
  discount_value: z.number().positive('Discount must be positive'),
  max_uses: z.number().int().positive().optional().nullable(),
  min_order_amount: z.number().min(0).optional().nullable(),
  expires_at: z.string().optional().or(z.literal('')),
})

export const eventWizardSchema = z.object({
  basics: eventBasicsSchema,
  location: eventLocationSchema,
  speakers: z.array(speakerSchema),
  ticket_types: z.array(ticketTypeSchema).min(1, 'At least one ticket type is required'),
  discount_codes: z.array(discountCodeSchema).optional(),
})

export type EventBasicsData = z.infer<typeof eventBasicsSchema>
export type EventLocationData = z.infer<typeof eventLocationSchema>
export type SpeakerData = z.infer<typeof speakerSchema>
export type TicketTypeData = z.infer<typeof ticketTypeSchema>
export type DiscountCodeData = z.infer<typeof discountCodeSchema>
export type EventWizardData = z.infer<typeof eventWizardSchema>
