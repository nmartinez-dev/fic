'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as settingsService from '@/services/settings-service';
import type { SettingsUpdate } from '@/types/settings';

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: settingsService.getSettings,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SettingsUpdate) => settingsService.updateSettings(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.settings }),
  });
}
