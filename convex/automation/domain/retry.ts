export const MAX_ATTEMPTS = 5;
const BASE_MS = 30_000;
const CAP_MS = 30 * 60_000;

export const backoffMs = (attempt: number): number =>
  Math.min(CAP_MS, BASE_MS * 2 ** Math.max(0, attempt - 1));

export const shouldRetry = (attempt: number): boolean => attempt < MAX_ATTEMPTS;

// n8n returns 404 while a webhook is still registering after a restart.
export const isTransient = (status: number | null): boolean =>
  status === null || [404, 408, 429].includes(status) || status >= 500;
