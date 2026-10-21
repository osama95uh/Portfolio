import { useEffect, useState } from "react";

export function useClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export function useUpTime() {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setUptime((u) => u + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return uptime;
}