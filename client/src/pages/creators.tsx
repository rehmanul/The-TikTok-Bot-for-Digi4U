import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  TrendingUp, 
  Eye,
  MessageSquare,
  Heart
} from 'lucide-react';

// Mock data for creators
const mockCreators = [
  {
    id: 1,
    username: '@fashionista_uk',
    name: 'Emma Thompson',
    followers: 125000,
    category: 'Fashion',
    lastInvited: '2024-01-15',
    status: 'accepted',
    engagement: '4.2%',
    avatar: null
  },
  {
    id: 2,
    username: '@fitness_guru_london',
    name: 'James Wilson',
    followers: 89000,
    category: 'Fitness',
    lastInvited: '2024-01-14',
    status: 'pending',
    engagement: '3.8%',
    avatar: null
  },
  {
    id: 3,
    username: '@beauty_by_sarah',
    name: 'Sarah Johnson',
    followers: 156000,
    category: 'Beauty',
    lastInvited: '2024-01-13',
    status: 'declined',
    engagement: '5.1%',
    avatar: null
  },
  {
    id: 4,
    username: '@lifestyle_london',
    name: 'Alex Brown',
    followers: 67000,
    category: 'Lifestyle',
    lastInvited: null,
    status: 'not_invited',
    engagement: '3.2%',
    avatar: null
  }
];

export default function Creators() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      case 'not_invited':
        return <Badge variant="outline">Not Invited</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredCreators = mockCreators.filter(creator => {
    const matchesSearch = creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || creator.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Creators</h2>
          <p className="text-sm text-muted-foreground">Manage and track your TikTok creator partnerships</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Creator
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-muted-foreground">Total Creators</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs text-muted-foreground">Active Partners</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground">Pending Invites</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">4.2%</p>
                  <p className="text-xs text-muted-foreground">Avg Engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Creator Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search creators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedCategory === 'fashion' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('fashion')}
                >
                  Fashion
                </Button>
                <Button
                  variant={selectedCategory === 'beauty' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('beauty')}
                >
                  Beauty
                </Button>
                <Button
                  variant={selectedCategory === 'fitness' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('fitness')}
                >
                  Fitness
                </Button>
                <Button
                  variant={selectedCategory === 'lifestyle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('lifestyle')}
                >
                  Lifestyle
                </Button>
              </div>
            </div>

            {/* Creators Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Invited</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreators.map((creator) => (
                  <TableRow key={creator.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={creator.avatar || undefined} />
                          <AvatarFallback>
                            {creator.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{creator.name}</p>
                          <p className="text-sm text-muted-foreground">{creator.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{creator.followers.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{creator.category}</Badge>
                    </TableCell>
                    <TableCell>{creator.engagement}</TableCell>
                    <TableCell>{getStatusBadge(creator.status)}</TableCell>
                    <TableCell>
                      {creator.lastInvited ? new Date(creator.lastInvited).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
