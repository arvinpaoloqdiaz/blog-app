import { useEffect, useState } from "react";

export default function useWakeApi(apiUrl) {
  const [waking, setWaking] = useState(false);
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    const wakeUp = async () => {
      try {
        setWaking(true);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const res = await fetch(apiUrl + "/health", { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          setAwake(true); // Already awake
        } else {
          // Try to wake it up by hitting the API root
          await fetch(apiUrl);
          setAwake(true);
        }
      } catch {
        try {
          await fetch(apiUrl); // attempt wake
          setAwake(true);
        } catch (e) {
          console.error("Failed to wake API:", e);
        }
      } finally {
        setWaking(false);
      }
    };

    wakeUp();
  }, [apiUrl]);

  return { waking, awake };
}
