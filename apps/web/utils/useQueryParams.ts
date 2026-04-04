"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook that syncs key-value state with URL search params.
 * Returns current params and a setter that updates the URL.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback(
    (key: string, fallback: string = "") => {
      return searchParams.get(key) || fallback;
    },
    [searchParams],
  );

  const getNumber = useCallback(
    (key: string, fallback: number = 1) => {
      const val = searchParams.get(key);
      const num = val ? parseInt(val, 10) : NaN;
      return isNaN(num) ? fallback : num;
    },
    [searchParams],
  );

  const set = useCallback(
    (updates: Record<string, string | number | undefined | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "" || value === 0) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return { get, getNumber, set };
}
