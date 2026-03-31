import useSWR from "swr";
import { apiFetch } from "@/lib/api-fetch";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function useAllBa() {
  const { data, error, isLoading } = useSWR(`${BASE_URL}/ba/get-all`);
  return {
    bams: data as { _id: string; username: string }[] | undefined,
    isLoading,
    isError: error,
  };
}

export function useCountries() {
  const { data, error, isLoading } = useSWR(`${BASE_URL}/country`);
  return {
    countries: data as { code: string; name: string }[] | undefined,
    isLoading,
    isError: error,
  };
}

export function useEntityById(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `${BASE_URL}/entity/${id}` : null,
  );
  return {
    entity: data as any | undefined,
    isLoading,
    isError: error,
    mutate: mutate as () => Promise<any>,
  };
}

export function useEntities(page: number, ba: string) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (ba) params.set("busuness_associate", ba);

  const { data, error, isLoading } = useSWR(
    `${BASE_URL}/entity/get-all?${params}`,
  );
  return {
    data: data?.data ?? [],
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    currentPage: data?.page ?? page,
    isLoading,
    isError: error,
  };
}

export function useApplications(page: number) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  const { data, error, isLoading } = useSWR(
    `${BASE_URL}/application?${params}`,
  );
  return {
    data: data?.data ?? [],
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    currentPage: data?.page ?? page,
    isLoading,
    isError: error,
  };
}

export function useApplicationById(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `${BASE_URL}/application/${id}` : null,
  );
  return {
    application: data as any | undefined,
    isLoading,
    isError: error,
    mutate: mutate as () => Promise<any>,
  };
}

export const createEntity = async (data: any) => {
  const response = await apiFetch(`${BASE_URL}/entity/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response;
};

// ─── CAB & Standard APIs ───

export function useCabs(page: number) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}/certificationbody?${params}`,
  );
  return {
    data: data?.data ?? [],
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    currentPage: data?.page ?? page,
    isLoading,
    isError: error,
    mutate: mutate as () => Promise<any>,
  };
}

export function useCabById(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `${BASE_URL}/certificationbody/${id}` : null,
  );
  return {
    cab: data as any | undefined,
    isLoading,
    isError: error,
    mutate: mutate as () => Promise<any>,
  };
}

export const createCab = async (data: any) => {
  const response = await apiFetch(`${BASE_URL}/certificationbody`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

export const updateCab = async (id: string, data: any) => {
  const response = await apiFetch(`${BASE_URL}/certificationbody/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

export function useStandards(page: number, certificationBody?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (certificationBody) params.set("certificationBody", certificationBody);
  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}/certificationbody/standard/all?${params}`,
  );
  return {
    data: data?.data ?? [],
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    currentPage: data?.page ?? page,
    isLoading,
    isError: error,
    mutate: mutate as () => Promise<any>,
  };
}

export function useAllCabsList() {
  const { data, error, isLoading } = useSWR(
    `${BASE_URL}/certificationbody?limit=100`,
  );
  return {
    cabs: (data?.data ?? []) as any[],
    isLoading,
    isError: error,
  };
}

export const createStandard = async (data: any) => {
  const response = await apiFetch(`${BASE_URL}/certificationbody/standard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

export const updateStandard = async (id: string, data: any) => {
  const response = await apiFetch(
    `${BASE_URL}/certificationbody/standard/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  return response;
};

export const updateEntity = async (entityId: string, data: any) => {
  const response = await apiFetch(`${BASE_URL}/entity/${entityId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response;
};
