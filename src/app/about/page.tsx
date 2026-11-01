import React from "react";
import ReactDOM from "react-dom";
import type { Metadata } from "next";
import AboutAnimatedView from "@/components/about/AboutAnimatedView";

export const metadata: Metadata = {
  title: "Our Story - The Leadership Covenant",
  description:
    "The vision, mission, values and CEO message behind The Leadership Covenant.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  ReactDOM.preload("/Our%20story/S1.png", {
    as: "image",
    fetchPriority: "high",
  });

  return <AboutAnimatedView />;
}
