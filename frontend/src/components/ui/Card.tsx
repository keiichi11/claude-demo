/**
 * Card Component - Container for content
 */

import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, padding = 'md', className, ...props }, ref) => {
    const baseStyles = 'bg-white rounded-lg shadow-md border border-gray-200';
    const hoverStyles = hover
      ? 'transition-all duration-200 hover:shadow-lg hover:scale-[1.02]'
      : '';

    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          baseStyles,
          hoverStyles,
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
