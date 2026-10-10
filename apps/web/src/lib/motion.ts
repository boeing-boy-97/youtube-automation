/**
 * ShortForge Studio Motion Design Tokens & Primitives
 * Built on Framer Motion with automatic prefers-reduced-motion fallbacks.
 */

import { useReducedMotion, type Transition, type Variants } from 'framer-motion';

export const motionTokens = {
  duration: {
    instant: 0.1,
    fast: 0.18,
    standard: 0.3,
    deliberate: 0.45,
    spatial: 0.55,
  },
  ease: {
    // Editorial ease-out: crisp start, gentle deceleration
    editorial: [0.16, 1, 0.3, 1] as const,
    // Smooth standard ease
    smooth: [0.25, 0.1, 0.25, 1] as const,
    // Snappy spring for interactive spatial elements
    snappySpring: {
      type: 'spring' as const,
      stiffness: 380,
      damping: 32,
      mass: 0.8,
    },
    // Gentle floating spring
    gentleSpring: {
      type: 'spring' as const,
      stiffness: 240,
      damping: 26,
      mass: 1,
    },
  },
};

export const standardTransition: Transition = {
  duration: motionTokens.duration.standard,
  ease: motionTokens.ease.editorial,
};

export const spatialTransition: Transition = {
  ...motionTokens.ease.gentleSpring,
};

/**
 * Reusable Motion Variants
 */
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.deliberate,
      ease: motionTokens.ease.editorial,
    },
  },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTokens.duration.standard,
      ease: motionTokens.ease.editorial,
    },
  },
};

export const staggerContainerVariants = (staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
    },
  },
});

export const scaleSubtleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: motionTokens.duration.standard,
      ease: motionTokens.ease.editorial,
    },
  },
};

export const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 1px 3px 0 rgba(37, 33, 31, 0.04)',
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.editorial },
  },
  hover: {
    y: -3,
    boxShadow: '0 8px 24px -4px rgba(37, 33, 31, 0.08)',
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.editorial },
  },
  tap: {
    y: 0,
    scale: 0.99,
    transition: { duration: motionTokens.duration.instant },
  },
};

/**
 * Hook to access reduced motion preference
 */
export function useMotionSafe() {
  const shouldReduce = useReducedMotion();
  return {
    shouldReduce: !!shouldReduce,
    transition: (t?: Transition): Transition => {
      if (shouldReduce) {
        return { duration: 0.01 };
      }
      return t || standardTransition;
    },
  };
}
