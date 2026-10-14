"use client";

import { useState, createContext, useContext } from "react";
import Loader from "./Loader";

export const LoaderContext = createContext(false);
export const useLoaderDone = () => useContext(LoaderContext);

export default function LoaderWrapper({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);

  return (
    <LoaderContext.Provider value={done}>
      {!done && <Loader onFinish={() => setDone(true)} />}
      <div className={done ? "opacity-100 transition-opacity duration-500" : "opacity-0"}>
        {children}
      </div>
    </LoaderContext.Provider>
  );
}