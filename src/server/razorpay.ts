import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const createOrderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  receipt: z.string(),
  notes: z.record(z.string(), z.string()).optional(),
})

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
})

export const createRazorpayOrder = createServerFn({ method: 'POST' })
  .inputValidator(createOrderSchema)
  .handler(async ({ data }: { data: z.infer<typeof createOrderSchema> }) => {
    const Razorpay = (await import('razorpay')).default
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured')
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const order = await razorpay.orders.create({
      amount: Math.round(data.amount * 100),
      currency: data.currency,
      receipt: data.receipt,
      notes: data.notes || {},
    })

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    }
  })

export const verifyRazorpayPayment = createServerFn({ method: 'POST' })
  .inputValidator(verifyPaymentSchema)
  .handler(async ({ data }: { data: z.infer<typeof verifyPaymentSchema> }) => {
    const crypto = await import('node:crypto')
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      throw new Error('Razorpay secret not configured')
    }

    const sign = data.razorpay_order_id + '|' + data.razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', keySecret)
      .update(sign)
      .digest('hex')

    const isValid = expectedSign === data.razorpay_signature

    return {
      verified: isValid,
      razorpay_order_id: data.razorpay_order_id,
      razorpay_payment_id: data.razorpay_payment_id,
    }
  })

export const getRazorpayKeyId = createServerFn({ method: 'GET' })
  .handler(async () => {
    return { key_id: process.env.RAZORPAY_KEY_ID || '' }
  })
