import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Activity,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// Mock activity data
const activityData = [
  {
    id: 1,
    type: 'invite_sent',
    description: 'Invitation sent to @fashionista_uk',
    status: 'success',
    timestamp: '2024-03-11T14:32:00Z',
    metadata: {
      creator: '@fashionista_uk',
      followers: '125K',
      category: 'Fashion'
    }
  },
  {
    id: 2,
    type: 'invite_accepted',
    description: '@beauty_guru accepted invitation',
    status: 'success',
    timestamp: '2024-03-11T14:30:00Z',
    metadata: {
      creator: '@beauty_guru',
      followers: '89K',
      category: 'Beauty'
    }
  },
  {
    id: 3,
    type: 'error',
    description: 'Failed to send invitation to @lifestyle_london',
    status: 'error',
    timestamp: '2024-03-11T14:28:00Z',
    metadata: {
      error: 'Rate limit exceeded',
      creator: '@lifestyle_london'
    }
  },
  {
    id: 4,
    type: 'bot_started',
    description: 'Bot session started',
    status: 'info',
    timestamp: '2024-03-11T14:25:00Z',
    metadata: {
      session_id: '123456',
      config: 'default'
    }
  }
];

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
    }
  };

  const filteredActivities = activityData.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Activity Logs</h2>
          <p className="text-sm text-muted-foreground">Monitor bot activities and system events</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">892</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedStatus === 'success' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('success')}
                >
                  Success
                </Button>
                <Button
                  variant={selectedStatus === 'error' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('error')}
                >
                  Errors
                </Button>
                <Button
                  variant={selectedStatus === 'warning' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('warning')}
                >
                  Warnings
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(activity.status)}
                          {getStatusBadge(activity.status)}
                        </div>
                      </TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(activity.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
