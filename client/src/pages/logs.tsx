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

import { useQuery } from '@tanstack/react-query';

const fetchActivities = async () => {
  const response = await fetch('/api/activities');
  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }
  return response.json();
};

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    refetchInterval: 5000,
  });

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
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-foreground">Activity Logs</h2>
          <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">Monitor bot activities and system events</p>
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
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <StaggerContainer className="space-y-4 lg:space-y-6">
          {/* Stats Cards */}
          <StaggerItem>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-3xl font-bold">{activities.length}</div>
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
                  <div className="text-3xl font-bold">{activities.filter((a: any) => a.type !== 'error').length}</div>
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
                  <div className="text-3xl font-bold">{activities.filter((a: any) => a.type === 'error').length}</div>
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
                  <div className="text-3xl font-bold">{activities.filter((a: any) => a.type === 'warning').length}</div>
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
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          </StaggerItem>
        </StaggerContainer>
      </main>
    </div>
  );
}
