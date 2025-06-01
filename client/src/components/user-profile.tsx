import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';

// User data
const user = {
  name: 'Digi4U Repair',
  email: 'admin@digi4u.com',
  role: 'Administrator'
};

export function UserProfile() {
  return (
    <Card className="user-profile p-4 bg-gradient-to-br from-background to-muted border-none">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-tiktok-primary to-tiktok-secondary flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <div className="mt-1">
            <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
