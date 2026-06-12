export function sanitizeDisplayName(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s._-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 32)
}
