import { getStoreSettingsAction } from '@/app/actions/settingsActions';
import SettingsTabs from '@/components/admin/settings/SettingsTabs';

export default async function SettingsPage() {
  const settingsResult = await getStoreSettingsAction();
  const initialSettings = settingsResult.data || {};

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik tracking-tight">
      <SettingsTabs initialSettings={initialSettings} />
    </div>
  );
}
