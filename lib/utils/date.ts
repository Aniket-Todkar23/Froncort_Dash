import { formatDistanceToNow, format } from 'date-fns'

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatAbsoluteTime(date: Date): string {
  return format(new Date(date), 'MMM dd, yyyy h:mm a')
}

export function formatDateOnly(date: Date): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatTimeOnly(date: Date): string {
  return format(new Date(date), 'h:mm a')
}

export function isOverdue(dueDate: Date): boolean {
  return new Date(dueDate) < new Date() && !isToday(new Date(dueDate))
}

export function isDueToday(dueDate: Date): boolean {
  return isToday(new Date(dueDate))
}

export function isDueSoon(dueDate: Date): boolean {
  const today = new Date()
  const due = new Date(dueDate)
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilDue <= 3 && daysUntilDue > 0
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}
