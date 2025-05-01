import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string | number): string {
  if (typeof time === 'string') {
    const date = new Date(time)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } else {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}
