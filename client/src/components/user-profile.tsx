import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

// User data interface
interface UserData {
  name: string;
  email: string;
  role: string;
}

export function UserProfile() {
  const [user, setUser] = useState<UserData>({
    name: 'Loading...',
    email: 'Loading...',
    role: 'Loading...'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/current');
        if (response.ok) {
          const userData = await response.json();
          setUser({
            name: userData.name || 'Digi4U Repair',
            email: userData.email || 'rehman.shoj2@gmail.com',
            role: userData.role || 'Administrator'
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Fallback to default data if fetch fails
        setUser({
          name: 'Digi4U Repair',
          email: 'rehman.shoj2@gmail.com',
          role: 'Administrator'
        });
      }
    };

    fetchUserData();
  }, []);

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
