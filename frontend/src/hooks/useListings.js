// src/hooks/useListings.js

import { useEffect, useState } from "react";
import { fetchListings } from "../lib/dataSource.js";

/**
 * React hook for loading listings.
 * It calls fetchListings(query) and gives the UI:
 * - rows (the cars)
 * - total (count)
 * - loading (spinner)
 * - err (if any error)
 */
export function useListings(query) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr("");

      try {
        const result = await fetchListings(query); // call datasource
        if (!cancelled) {
          setRows(result.data || []);
          setTotal(result.total || 0);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || "Failed to load listings");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    // cleanup when component unmounts
    return () => { cancelled = true; };
  }, [JSON.stringify(query)]);  
  // 🔥 JSON.stringify ensures effect re-runs when filters change

  return { rows, total, loading, err };
}
