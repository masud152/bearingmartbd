"use client";

import { useEffect, useState } from "react";

export default function HitCounter() {
  const [hits, setHits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/hits", { method: "POST" })
      .then((response) => response.json())
      .then((data: { hits?: number }) => setHits(data.hits ?? null))
      .catch(() => undefined);
  }, []);

  return <div className="hit-counter" aria-label="Website visitor count">Site visits: <strong>{hits === null ? "—" : hits.toLocaleString()}</strong></div>;
}
