import { EntityDef } from "@/app/(home)/entity/components/columns";
import useSWR from "swr";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// get all ba
export function useAllBa() {
  const { data, error, isLoading } = useSWR(`${BASE_URL}/ba/get-all`);
  return {
    bams: data as { _id: string; username: string }[] | undefined,
    isLoading,
    isError: error,
  };
}

// get all countries
export function useCountries() {
  const { data, error, isLoading } = useSWR(`${BASE_URL}/country`);
  return {
    countries: data as { code: string; name: string }[] | undefined,
    isLoading,
    isError: error,
  };
}

// get all languages
export function useLanguages() {
  const { data, error, isLoading } = useSWR(`${BASE_URL}/country/languages`);
  return {
    languages: (data ?? []) as string[],
    isLoading,
    isError: error,
  };
}

// get entity by id
export function useEntityById(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `${BASE_URL}/entity/${id}` : null,
    { refreshInterval: 0 },
  );
  return {
    entity: data as EntityDef | undefined,
    isLoading,
    isError: error,
    mutate: mutate as () => Promise<any>,
  };
}

// get all entities
export function useEntities(page: number, ba: string, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (ba) params.set("business_associate", ba);
  if (search) params.set("search", search);

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

// get all applications
export function useApplications(page: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (search) params.set("search", search);
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

// get application by id
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

// get all cabs
export function useCabs(page: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (search) params.set("search", search);
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

// get cab by id
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

// get all standards
export function useStandards(page: number, certificationBody?: string, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (certificationBody) params.set("certificationBody", certificationBody);
  if (search) params.set("search", search);
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

// get all standards list
export function useAllStandardsList() {
  const { data, error, isLoading } = useSWR(
    `${BASE_URL}/certificationbody/standard/all?limit=200`,
  );
  return {
    standards: (data?.data ?? []) as any[],
    isLoading,
    isError: error,
  };
}

// get all cabs list
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

// ─── BA (paginated) ───

export function useBAs(page: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (search) params.set("search", search);
  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}/ba/get-all-paginated?${params}`,
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

// ─── Permissions ───

export function usePermissions(page: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (search) params.set("search", search);

  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}/permission/get-all?${params}`,
  );
  return {
    data: data?.data ?? [],
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    isLoading,
    isError: error,
    mutate: mutate as () => Promise<any>,
  };
}

export function useAllPermissions() {
  const { data, error, isLoading } = useSWR(`${BASE_URL}/permission`);
  return {
    permissions: (data ?? []) as any[],
    isLoading,
    isError: error,
  };
}

// ─── Roles ───

export function useRoles(page: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (search) params.set("search", search);

  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}/role/get-all?${params}`,
  );
  return {
    data: data?.data ?? [],
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    isLoading,
    isError: error,
    mutate: mutate as () => Promise<any>,
  };
}

export function useAllRoles() {
  const { data, error, isLoading } = useSWR(`${BASE_URL}/role`);
  return {
    roles: (data ?? []) as any[],
    isLoading,
    isError: error,
  };
}

// ─── Users ───

export function useUsers(page: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (search) params.set("search", search);

  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}/user/get-all?${params}`,
  );
  return {
    data: data?.data ?? [],
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    isLoading,
    isError: error,
    mutate: mutate as () => Promise<any>,
  };
}

