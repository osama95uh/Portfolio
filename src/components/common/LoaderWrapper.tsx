"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Loader from "./Loader";

export const LoaderContext = createContext(false);
export const useLoaderDone = () => useContext(LoaderContext);

export default function LoaderWrapper({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("siam_booted");
    if (hasVisited) {
      setDone(true);
      setShowLoader(false);
    } else {
      setShowLoader(true);
    }
  }, []);

  const handleFinish = () => {
    try {
      sessionStorage.setItem("siam_booted", "true");
    } catch {}
    setDone(true);
    setShowLoader(false);
  };

  return (
    <LoaderContext.Provider value={done}>
      {showLoader && <Loader onFinish={handleFinish} />}
      <div className={done ? "opacity-100 transition-opacity duration-500" : "opacity-0"}>
        {children}
      </div>
    </LoaderContext.Provider>
  );
}