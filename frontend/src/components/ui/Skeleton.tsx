/**
 * Skeleton Component - Content placeholder for loading states
 */

import { clsx } from 'clsx';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
}

export function Skeleton({
  width,
  height,
  variant = 'text',
  className,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200';

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      style={style}
      aria-label="読み込み中"
    />
  );
}
