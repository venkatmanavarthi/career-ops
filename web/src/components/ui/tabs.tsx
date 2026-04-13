import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used inside Tabs.');
  }
  return context;
}

export function Tabs({
  value,
  onValueChange,
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement> & TabsContextValue) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('flex flex-col gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-2 rounded-[1.5rem] border border-border bg-card/80 p-2',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  value,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { value: activeValue, onValueChange } = useTabsContext();
  const active = activeValue === value;

  return (
    <button
      type="button"
      className={cn(
        'rounded-full px-4 py-2 text-sm transition',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
        className,
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: activeValue } = useTabsContext();
  if (activeValue !== value) {
    return null;
  }

  return <div className={cn('flex flex-col gap-6', className)} {...props} />;
}
