"use client";

import React, { ReactNode } from "react";
import { SWRConfig } from "swr";
import axios from "axios";

interface SwrProviderProps {
  children: ReactNode;
}

export const SwrProvider: React.FC<SwrProviderProps> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        refreshInterval: 20000,
        fetcher: async (url: string) => {
          return axios(url, {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          })
            .then((res) => res?.data)
            .catch((err) => {
              throw err;
            });
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};
