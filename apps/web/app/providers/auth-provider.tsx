"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import toast, { Toaster } from "react-hot-toast";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      <Toaster />
      {children}
    </>
  );
}