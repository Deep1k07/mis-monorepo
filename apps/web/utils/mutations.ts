import { apiFetch } from "@/lib/api-fetch";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── Entity ───

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

// ─── Application ───

export const createApplication = async (data: any) => {
  const response = await apiFetch(`${BASE_URL}/application`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

export const updateApplication = async (id: string, data: any) => {
  const response = await apiFetch(`${BASE_URL}/application/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

// ─── BA ───

export const createBa = async (data: any) => {
  const response = await apiFetch(`${BASE_URL}/ba`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

export const updateBa = async (id: string, data: any) => {
  const response = await apiFetch(`${BASE_URL}/ba/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

// ─── CAB ───

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

// ─── Standard ───

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

// ─── Permission ───

export const createPermission = async (data: any) => {
  const response = await apiFetch(`${BASE_URL}/permission`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

export const updatePermission = async (id: string, data: any) => {
  const response = await apiFetch(`${BASE_URL}/permission/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

// ─── Role ───

export const createRole = async (data: any) => {
  const response = await apiFetch(`${BASE_URL}/role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

export const updateRole = async (id: string, data: any) => {
  const response = await apiFetch(`${BASE_URL}/role/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

// ─── User ───

export const createUser = async (data: any) => {
  const response = await apiFetch(`${BASE_URL}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};

export const updateUser = async (id: string, data: any) => {
  const response = await apiFetch(`${BASE_URL}/user/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response;
};
