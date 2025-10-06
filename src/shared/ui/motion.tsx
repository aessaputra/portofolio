"use client";

import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useScroll,
} from "framer-motion";
import type { ComponentType } from "react";

export { motion, AnimatePresence, useInView, useMotionValue, useSpring, useScroll };

export const makeMotion = <P extends object>(Comp: ComponentType<P>) => motion.create(Comp);

export const m = motion;
