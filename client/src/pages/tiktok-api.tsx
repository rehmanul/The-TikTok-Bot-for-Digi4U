import { TikTokAPIManager } from '@/components/TikTokAPIManager';

export default function TikTokAPI() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">TikTok Official API</h2>
      </div>
      <div className="space-y-4">
        <TikTokAPIManager />
      </div>
    </div>
  );
}