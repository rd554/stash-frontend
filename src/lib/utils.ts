import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTheme() {
  // Always return light theme since we removed dark theme support
  return 'light'
}

export function setTheme() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('stash-ai-theme', 'light')
    // Always remove dark class since we only support light theme
    document.documentElement.classList.remove('dark')
  }
} 