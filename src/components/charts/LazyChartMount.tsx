// components/charts/LazyChartMount.tsx
import React, { useEffect, useRef, useState } from "react";
import Skeleton from "@/components/ui/skeleton/Skeleton";

interface LazyChartMountProps {
  children: React.ReactNode;
  minHeight?: number;
}

const LazyChartMount: React.FC<LazyChartMountProps> = ({ children, minHeight = 340 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" } // empieza a montar un poco antes de que sea visible
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={ref} style={{ minHeight: isVisible ? undefined : minHeight }}>
      {isVisible ? children : <Skeleton className="w-full h-full" />}
    </div>
  );
};

export default LazyChartMount;