'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from its current displayed value to the target value
 * using a spring-like easing over 300ms.
 *
 * During fast updates (< 500ms apart), debounces to prevent jitter.
 */
export function useAnimatedNumber(target: number, duration = 300, debounceMs = 500): number {
  const [displayed, setDisplayed] = useState(target);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef({ value: target, time: 0 });

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // If updates are arriving faster than debounceMs, debounce
    if (timeSinceLastUpdate < debounceMs && lastUpdateRef.current > 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        runAnimation(target, now);
      }, debounceMs - timeSinceLastUpdate);
      return;
    }

    runAnimation(target, now);

    function runAnimation(toValue: number, startTime: number) {
      lastUpdateRef.current = startTime;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const fromValue = displayed;
      startRef.current = { value: fromValue, time: startTime };

      function step() {
        const elapsed = Date.now() - startRef.current.time;
        const progress = Math.min(elapsed / duration, 1);
        // Spring-like easing: ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(fromValue + (toValue - fromValue) * eased);

        setDisplayed(current);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step);
        } else {
          animationRef.current = null;
        }
      }

      animationRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return displayed;
}
