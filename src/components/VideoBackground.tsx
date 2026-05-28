"use client";

import React, { useEffect, useRef } from "react";

// Remote royalty‑free space videos (MixKit). These URLs are public MP4 files.
const VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-glowing-nebula-in-space-23577-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-galaxy-with-stars-in-space-1611-large.mp4",
];

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cycle through videos every 12 seconds (slow) and set a slower playback rate.
  useEffect(() => {
    let index = 0;
    const video = videoRef.current;
    if (!video) return;

    // Initial slow playback rate (35% speed)
    video.playbackRate = 0.35;

    const changeVideo = () => {
      index = (index + 1) % VIDEOS.length;
      video.src = VIDEOS[index];
      video.load();
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.log("Video play error:", e));
      }
    };

    const interval = setInterval(changeVideo, 12000); // 12 s per clip
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="video-background-container">
      <video
        ref={videoRef}
        src={VIDEOS[0]}
        muted
        autoPlay
        loop
        playsInline
        className="video-layer"
      />
      <div className="video-overlay" />
    </div>
  );
}
