import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const ERROR_MAP = {
  'Invalid login credentials': 'Email or password is incorrect.',
  'Email not confirmed': 'Please confirm your email before signing in.',
  'User already registered': 'An account with this email already exists.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters.',
  'Unable to validate email address: invalid format': 'Please enter a valid email address.',
  'New password should be different from the old password': 'New password must be different from your current one.',
  'Token has expired or is invalid': 'The link has expired. Please request a new one.',
  'rate_limit_exceeded': 'Too many attempts. Please try again later.',
  'over_request_rate_limit': 'Too many requests. Please wait a moment.',
  'Row Level Security': 'You don\'t have permission to perform this action.',
}

export function friendlyError(err) {
  const msg = err?.message || String(err)
  for (const [key, friendly] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return friendly
  }
  if (msg.includes('duplicate key') && msg.includes('username')) return 'This username is already taken.'
  if (msg.includes('duplicate key') && msg.includes('email')) return 'An account with this email already exists.'
  if (err?.code === '23505') return 'This entry already exists.'
  if (err?.code === '42501' || err?.code === '42P01') return 'Database permission error. Please try again.'
  return msg.length > 120 ? 'Something went wrong. Please try again.' : msg
}
