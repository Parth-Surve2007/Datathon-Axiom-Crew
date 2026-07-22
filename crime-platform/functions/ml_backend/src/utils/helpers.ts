import { v4 as uuidv4 } from 'uuid';

/** Generate a new UUID v4 */
export const generateId = (): string => uuidv4();

/** Async sleep */
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Safely parse JSON, returning null on failure */
export const safeJsonParse = <T>(json: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

/** Convert snake_case DB columns to camelCase JS objects */
export const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

export const keysToCamel = <T extends Record<string, unknown>>(obj: T): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [snakeToCamel(k), v]));

/** Sanitise a string for use as a DB identifier (strip non-alphanumeric) */
export const sanitizeIdentifier = (str: string): string =>
  str.replace(/[^a-zA-Z0-9_]/g, '');

/** Mask sensitive string values (e.g., partial email) */
export const maskEmail = (email: string): string => {
  const [user, domain] = email.split('@');
  if (!user || !domain) return '***';
  return `${user.slice(0, 2)}***@${domain}`;
};

/** Clamp a number between min and max */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Chunk an array into smaller arrays of a given size */
export const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
