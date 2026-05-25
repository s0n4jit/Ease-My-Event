import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000),
})

export const refundSchema = z.object({
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)').max(500),
})

export const refundProcessSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  admin_notes: z.string().max(500).optional().or(z.literal('')),
  refund_amount: z.number().min(0).optional(),
})

export type ReviewFormData = z.infer<typeof reviewSchema>
export type RefundFormData = z.infer<typeof refundSchema>
export type RefundProcessFormData = z.infer<typeof refundProcessSchema>
