"use client";

import { useEffect, useState } from "react";

export default function useOwner() {
  const [owner, setOwner] = useState(false);
  useEffect(() => {
    let active = true;
    const check = () => fetch("/api/notes/session", { cache: "no-store" }).then(res => res.json()).then(data => {
      if (active) setOwner(data.authenticated === true);
    }).catch(() => { if (active) setOwner(false); });
    void check();
    window.addEventListener("focus", check);
    return () => { active = false; window.removeEventListener("focus", check); };
  }, []);
  return owner;
}
