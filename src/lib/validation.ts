/**
 * Hand-rolled validation — no schema library needed for a single-admin CMS.
 * Every validator returns a human-readable sentence suitable for display.
 */

export interface ValidationResult<T> {
  value?: T;
  error?: string;
}

export type FieldErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function requireString(value: unknown, label: string, max = 200): ValidationResult<string> {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return { error: `${label} is required.` };
  if (text.length > max) return { error: `${label} must be ${max} characters or fewer.` };
  return { value: text };
}

export function optionalString(value: unknown, max = 4000): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  return text.slice(0, max);
}

export function validateSlug(value: unknown): ValidationResult<string> {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return { error: "A URL slug is required." };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text)) {
    return { error: "Use lowercase letters, numbers and single hyphens only (e.g. nigeria-inflation-dashboard)." };
  }
  if (text.length > 80) return { error: "Keep the slug under 80 characters." };
  return { value: text };
}

export function validateEmail(value: unknown): ValidationResult<string> {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return { error: "Enter your email address." };
  if (!EMAIL.test(text)) return { error: "That email address does not look right." };
  return { value: text };
}

export function validatePassword(value: unknown): ValidationResult<string> {
  const text = typeof value === "string" ? value : "";
  if (!text) return { error: "Enter your password." };
  if (text.length < 8) return { error: "Password must be at least 8 characters." };
  return { value: text };
}

export function validateUrl(value: unknown): ValidationResult<string> {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return { error: "Enter a URL." };
  try {
    const parsed = new URL(text);
    if (!/^https?:$/.test(parsed.protocol)) {
      return { error: "Links must start with http:// or https://." };
    }
    return { value: parsed.toString() };
  } catch {
    return { error: "That is not a valid URL." };
  }
}

export function validateContactMessage(value: unknown): ValidationResult<string> {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return { error: "Add a short message." };
  if (text.length < 12) return { error: "Tell me a little more — at least a sentence." };
  if (text.length > 3000) return { error: "Please keep the message under 3000 characters." };
  return { value: text };
}

export function firstError(errors: FieldErrors): string | null {
  const values = Object.values(errors);
  return values.length ? values[0] : null;
}
