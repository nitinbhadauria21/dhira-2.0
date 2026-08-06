'use client';

import React, { useEffect, useState } from 'react';
import FloatingBuddy from '@/components/FloatingBuddy';
import { BUDDY_GESTURE_POSES, type BuddyPose } from '@/lib/buddyGestures';

type BuddyGestureCarouselProps = {
  poses?: BuddyPose[];
  /** Auto-advance interval while active (ms). */
  intervalMs?: number;
  /** When false, show first pose only. */
  active?: boolean;
  /** Faster cycling (e.g. while Google sign-in is loading). */
  emphasis?: boolean;
  width?: number;
  className?: string;
};

export default function BuddyGestureCarousel({
  poses = BUDDY_GESTURE_POSES,
  intervalMs = 4500,
  active = true,
  emphasis = false,
  width = 78,
  className = '',
}: BuddyGestureCarouselProps) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!active || reducedMotion || poses.length <= 1) return undefined;
    const ms = emphasis ? Math.min(2200, intervalMs) : intervalMs;
    const id = window.setInterval(() => {
      setIndex((i) => {
        setPrevIndex(i);
        setSliding(true);
        return (i + 1) % poses.length;
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [active, emphasis, intervalMs, poses.length, reducedMotion]);

  useEffect(() => {
    if (!sliding) return undefined;
    const t = window.setTimeout(() => setSliding(false), 900);
    return () => window.clearTimeout(t);
  }, [sliding, index]);

  const current = poses[index] ?? poses[0];
  const previous = poses[prevIndex] ?? poses[0];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width + 48,
        height: Math.max(width * 1.35, 110),
        marginInline: 'auto',
      }}
      aria-live="polite"
      aria-label="DHIRA companion gestures"
    >
      <div
        className="absolute inset-0 flex items-end justify-center"
        style={{ paddingBottom: 4 }}
      >
        {sliding && !reducedMotion ? (
          <>
            <div
              className="buddy-carousel-slide buddy-carousel-exit"
              style={{ position: 'absolute', bottom: 4 }}
            >
              <FloatingBuddy src={previous.src} alt="" width={width} aria-hidden />
            </div>
            <div
              className="buddy-carousel-slide buddy-carousel-enter"
              style={{ position: 'absolute', bottom: 4 }}
            >
              <FloatingBuddy src={current.src} alt={current.alt} width={width} />
            </div>
          </>
        ) : (
          <FloatingBuddy src={current.src} alt={current.alt} width={width} />
        )}
      </div>
      <style jsx>{`
        .buddy-carousel-slide {
          will-change: transform, opacity;
        }
        .buddy-carousel-enter {
          animation: buddyCarouselEnter 0.85s ease-in-out forwards;
        }
        .buddy-carousel-exit {
          animation: buddyCarouselExit 0.85s ease-in-out forwards;
        }
        @keyframes buddyCarouselEnter {
          from {
            opacity: 0;
            transform: translateX(28px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes buddyCarouselExit {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-28px);
          }
        }
      `}</style>
    </div>
  );
}
