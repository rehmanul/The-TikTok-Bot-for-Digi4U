import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  DollarSign,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

// Mock data for charts
const dailyInvitesData = [
  { date: '2024-01-08', invites: 45, accepted: 12 },
  { date: '2024-01-09', invites: 52, accepted: 18 },
  { date: '2024-01-10', invites: 38, accepted: 15 },
  { date: '2024-01-11', invites: 61, accepted: 22 },
  { date: '2024-01-12', invites: 49, accepted: 19 },
  { date: '2024-01-13', invites: 55, accepted: 25 },
  { date: '2024-01-14', invites: 67, accepted: 28 }
];

const categoryData = [
  { name: 'Fashion', value: 35, color: '#8884d8' },
  { name: 'Beauty', value: 28, color: '#82ca9d' },
  { name: 'Fitness', value: 22, color: '#ffc658' },
  { name: 'Lifestyle', value: 15, color: '#ff7300' }
];

const performanceData = [
  { month: 'Oct', revenue: 2400, creators: 45, campaigns: 12 },
  { month: 'Nov', revenue: 3200, creators: 52, campaigns: 18 },
  { month: 'Dec', revenue: 2800, creators: 48, campaigns: 15 },
  { month: 'Jan', revenue: 4100, creators: 61, campaigns: 22 }
];

export default function Analytics() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground">Track performance and insights for your TikTok campaigns</p>
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">£12,450</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+12.5%</span>
                </div>
              </div>
              <div className="mt-2">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-muted-foreground">Total Invites Sent</p>
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+8.2%</span>
                </div>
              </div>
              <div className="mt-2">
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">34.2%</p>
                  <p className="text-xs text-muted-foreground">Acceptance Rate</p>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+2.1%</span>
                </div>
              </div>
              <div className="mt-2">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs text-muted-foreground">Active Creators</p>
                </div>
                <div className="flex items-center space-x-1 text-red-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm">-1.5%</span>
                </div>
              </div>
              <div className="mt-2">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Invites Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Invites & Acceptance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyInvitesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="invites" fill="#8884d8" name="Invites Sent" />
                  <Bar dataKey="accepted" fill="#82ca9d" name="Accepted" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Creator Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Revenue (£)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="creators" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Active Creators"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Performing Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">Fashion</p>
                  <p className="text-sm text-muted-foreground">42% acceptance rate</p>
                </div>
                <Badge className="bg-green-100 text-green-800">+15%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Best Day Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">Saturday</p>
                  <p className="text-sm text-muted-foreground">Avg 67 invites/day</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Peak</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Monthly Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">+28%</p>
                  <p className="text-sm text-muted-foreground">Creator partnerships</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Growing</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
