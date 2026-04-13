import * as React from 'react';
import { cn } from '@/lib/utils';

export const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn('rounded-3xl border border-border bg-secondary/60 p-4 text-sm', className)}
      {...props}
    />
  ),
);
Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('font-medium', className)} {...props} />
  ),
);
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('mt-1 text-muted-foreground', className)} {...props} />
  ),
);
AlertDescription.displayName = 'AlertDescription';
