import { useRef, useLayoutEffect } from 'react';

/**
 * Scroll-reveal hook. Uses useLayoutEffect so IntersectionObserver
 * fires before browser paint, preventing the opacity:0 flash on
 * above-the-fold elements.
 */
export function useReveal() {
  const revealRefs = useRef<HTMLElement[]>([]);

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return { addToReveal };
}
