'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { IconTooltip } from '@/components/ui/icon-button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconTooltip label="Cargando tema">
        <Button variant="ghost" size="icon" disabled aria-label="Cargando tema">
          <Sun className="h-5 w-5" />
        </Button>
      </IconTooltip>
    );
  }

  const isDark = resolvedTheme === 'dark';
  const themeTooltip = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <IconTooltip label={themeTooltip}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={themeTooltip}
        className="cursor-pointer"
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </IconTooltip>
  );
}
