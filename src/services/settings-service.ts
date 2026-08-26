import { createClient } from '@/lib/supabase/client';
import type { Settings, SettingsUpdate } from '@/types/settings';

export async function getSettings(): Promise<Settings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw new Error(error.message);
  return data as Settings;
}

export async function updateSettings(input: SettingsUpdate): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('settings')
    .update({
      ...input,
      updated_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  if (error) throw new Error(error.message);
}
