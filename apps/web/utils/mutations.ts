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
