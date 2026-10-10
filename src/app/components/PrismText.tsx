"use client";

import { useEffect } from "react";
import { startPrismText } from "../lib/prismText";

// Prism on display headings, site-wide (see lib/prismText.ts).
export default function PrismText() {
  useEffect(() => startPrismText(), []);
  return null;
}
