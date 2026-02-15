import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({ value, duration = 1500, prefix = '₹', decimals = 2 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const startValue = startRef.current;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * eased;
      
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        startRef.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return (
    <span className="font-mono tabular-nums">
      {prefix}{displayValue.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}
