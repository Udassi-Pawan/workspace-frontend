"use client";

import React, { createContext, useState } from "react";
import Spinner from "./Spinner";

export interface SpinnerProviderProps {
  children: React.ReactNode;
}

const SpinnerContext = createContext<any>(null);
export { SpinnerContext };

export default function SpinnerProvider({ children }: SpinnerProviderProps) {
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <SpinnerContext.Provider value={{ setLoading }}>
      <div className="relative">
        {loading && (
          <div className="absolute fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-40">
            <Spinner />
          </div>
        )}
        <div className="">{children}</div>
      </div>
    </SpinnerContext.Provider>
  );
}
