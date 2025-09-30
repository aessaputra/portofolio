'use client'
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useScroll, HTMLMotionProps } from 'framer-motion'
import React, { ComponentType, forwardRef } from 'react'

export { motion, AnimatePresence, useInView, useMotionValue, useSpring, useScroll }

// Factory for motion.create with proper typing
export const makeMotion = <P extends object>(Comp: ComponentType<P>) => motion.create(Comp)

// Convenience: prebuilt motion for common tags (optional)
export const m = motion