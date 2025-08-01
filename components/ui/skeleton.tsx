import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "circular" | "rectangular" | "rounded";
  animation?: "pulse" | "wave" | "none";
  children?: React.ReactNode;
}

export function Skeleton({
  className,
  width,
  height,
  variant = "rounded",
  animation = "pulse",
  children,
  ...props
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  const variantClasses = {
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-md",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "skeleton-wave",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-gray-200 dark:bg-gray-800",
        variantClasses[variant],
        animationClasses[animation],
        "relative overflow-hidden",
        className
      )}
      style={{
        width: width || "100%",
        height: height || "1rem",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
