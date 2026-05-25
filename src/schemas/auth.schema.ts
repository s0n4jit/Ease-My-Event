import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72, 'Password is too long'),
  confirm_password: z.string(),
  role: z.enum(['attendee', 'organiser']),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(15).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  linkedin_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
