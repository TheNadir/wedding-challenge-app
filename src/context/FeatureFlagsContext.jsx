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

    // Keep flags in sync so toggling a row in Supabase takes effect immediately
    // for users already on the page (important for ceremony mode).
    const channel = supabase
      .channel("feature_flags_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "feature_flags" },
        (payload) => {
          setFlags((prev) => ({
            ...prev,
            [payload.new.key]: payload.new.enabled,
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
