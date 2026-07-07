"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotos } from "@/hooks/usePhotos";

export default function PhotoBackground() {
  const { photos } = usePhotos();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, 30_000);
    return () => clearInterval(id);
  }, [photos.length]);

  if (photos.length === 0) return null;

  const src = `/api/photos/${encodeURIComponent(photos[index])}`;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence>
        <motion.img
          key={src}
          src={src}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/55" />
    </div>
  );
}
