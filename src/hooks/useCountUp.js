import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Triggers when the element enters the viewport.
 */
export function useCountUp(target, duration = 1400) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = performance.now();
                    const tick = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        // easeOutExpo for a satisfying deceleration
                        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                        setCount(Math.round(ease * target));
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
}
