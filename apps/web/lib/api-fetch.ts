import { handleUnauthorized } from "@/store/auth-store";

/**
 * Wrapper around fetch that auto-logs out on 401 (expired token).
 * Use this instead of raw `fetch()` for authenticated API calls.
 */
export async function apiFetch(
  input: string | URL | RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, {
    credentials: "include",
    ...init,
  });

  if (res.status === 401) {
    handleUnauthorized();
  }

  return res;
}
