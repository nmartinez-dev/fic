'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const iconButtonClassName = 'h-8 w-8';

type IconTooltipProps = {
  label: string;
  children: React.ReactElement;
};

/** Envuelve un trigger (p. ej. DialogTrigger) para mostrar tooltip en icon buttons. */
export function IconTooltip({ label, children }: IconTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex [&:has(button:disabled)]:cursor-not-allowed">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

type IconButtonProps = React.ComponentProps<typeof Button> & {
  tooltip: string;
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { tooltip, className, variant = 'outline', disabled, ...props },
    ref
  ) {
    return (
      <IconTooltip label={tooltip}>
        <Button
          ref={ref}
          type="button"
          size="icon"
          variant={variant}
          className={cn(iconButtonClassName, className)}
          disabled={disabled}
          aria-label={tooltip}
          {...props}
        />
      </IconTooltip>
    );
  }
);
