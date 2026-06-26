"use client";

import { useState, useEffect } from "react";

export type Orientation = "portrait" | "landscape";

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>("landscape");

  useEffect(() => {
    const update = () => {
      if (typeof screen !== "undefined" && screen.orientation) {
        setOrientation(
          screen.orientation.type.startsWith("portrait") ? "portrait" : "landscape"
        );
      } else {
        setOrientation(
          window.innerHeight > window.innerWidth ? "portrait" : "landscape"
        );
      }
    };

    update();

    window.addEventListener("resize", update);
    if (screen.orientation) {
      screen.orientation.addEventListener("change", update);
    } else {
      window.addEventListener("orientationchange", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (screen.orientation) {
        screen.orientation.removeEventListener("change", update);
      } else {
        window.removeEventListener("orientationchange", update);
      }
    };
  }, []);

  return orientation;
}
