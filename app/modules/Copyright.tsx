"use client";

import { useEffect, useState } from "react";

export default function Copyright() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setYear(new Date().getFullYear());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return <p>©{year ?? ""} くろねこ。の実験室</p>;
}
