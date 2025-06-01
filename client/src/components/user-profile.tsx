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
    name: 'Digi4U Repair',
    email: 'rehman.sho@gmail.com',
    role: 'Administrator'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/current');
        if (response.ok) {
          const userData = await response.json();
          setUser({
            name: userData.name || 'Digi4U Repair',
            email: userData.email || 'rehman.sho@gmail.com',
            role: userData.role || 'Administrator'
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Fallback to default data if fetch fails
        setUser({
          name: 'Digi4U Repair',
          email: 'rehman.sho@gmail.com',
          role: 'Administrator'
        });
      }
    };

    fetchUserData();
  }, []);

  return (
    <Card className="user-profile p-4 bg-white border shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center p-1">
          <img src="/digi4u-logo.png" alt="Digi4U" className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-black truncate">{user.name}</p>
          <p className="text-xs text-gray-600 w-full">{user.email}</p>
          <div className="mt-1">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-black">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
