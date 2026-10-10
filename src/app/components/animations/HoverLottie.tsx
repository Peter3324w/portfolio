"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface HoverLottieProps {
  src: string;
  hovered: boolean;
  size?: number;
}

export default function HoverLottie({ src, hovered, size = 18 }: HoverLottieProps) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!data) return <span style={{ width: size, height: size, display: "inline-block" }} />;

  return (
    <Lottie
      key={hovered ? "play" : "stop"}
      animationData={data}
      loop={hovered}
      autoplay={hovered}
      style={{ width: size, height: size }}
    />
  );
}
