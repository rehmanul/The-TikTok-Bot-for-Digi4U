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
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
        <div className="w-6 h-6 bg-gradient-to-r from-primary to-pink-500 rounded-full"></div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{user.name}</p>
        <p className="text-xs text-white/70">{user.email}</p>
        <div className="mt-1">
          <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/90">
            {user.role}
          </span>
        </div>
      </div>
    </div>
  );
}
