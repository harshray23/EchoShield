
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts a Firestore index creation link from an error message.
 */
export function extractFirestoreIndexLink(message: string): string | null {
  const match = message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
  return match ? match[0] : null;
}
