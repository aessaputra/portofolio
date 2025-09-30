"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "@/components/motion/Motion";

interface CounterProps {
  value: number;
  className?: string;
  suffix?: string;
}

const Counter = ({ value, className = "", suffix = "" }: CounterProps) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const inViewRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 3000 });
  const isInView = useInView(inViewRef, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    if (spanRef.current) {
      spanRef.current.textContent = `0${suffix}`;
    }
  }, [suffix]);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (!spanRef.current) {
        return;
      }
      const rounded = Number(latest.toFixed(0));
      if (rounded <= value) {
        spanRef.current.textContent = `${rounded}${suffix}`;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [springValue, suffix, value]);

  return (
    <span ref={inViewRef}>
      <span ref={spanRef} className={className} />
    </span>
  );
};

export default function AboutCounters() {
  return (
    <div className="col-span-2 flex flex-col items-end justify-between xl:col-span-8 xl:flex-row xl:items-center md:order-3">
      <div className="flex flex-col items-end justify-center xl:items-center">
        <Counter value={8} suffix="+" className="inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl" />
        <h2 className="text-xl font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg sm:text-base xs:text-sm">
          Satisfied Clients
        </h2>
      </div>

      <div className="flex flex-col items-end justify-center xl:items-center">
        <Counter value={10} suffix="+" className="inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl" />
        <h2 className="text-xl font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg sm:text-base xs:text-sm">
          Projects Completed
        </h2>
      </div>

      <div className="flex flex-col items-end justify-center xl:items-center">
        <Counter value={4} suffix="+" className="inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl" />
        <h2 className="text-xl font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg sm:text-base xs:text-sm">
          Years of Experience
        </h2>
      </div>
    </div>
  );
}
