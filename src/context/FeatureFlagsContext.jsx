import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const FeatureFlagsContext = createContext({ flags: {}, loading: true });

export function FeatureFlagsProvider({ children }) {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      try {
        const { data, error } = await supabase
          .from("feature_flags")
          .select("key, enabled");

        if (error) throw error;

        const map = {};
        for (const row of data ?? []) {
          console.log("row ==>", row);
          map[row.key] = row.enabled;
        }
        setFlags(map);
      } catch (err) {
        console.warn(
          "Failed to load feature flags — all features hidden:",
          err.message,
        );
        setFlags({});
      } finally {
        setLoading(false);
      }
    }

    fetchFlags();
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
