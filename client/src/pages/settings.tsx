import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Users, 
  Clock, 
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface BotConfig {
  minFollowers: number;
  maxFollowers: number;
  dailyLimit: number;
  actionDelay: number;
  categories: string[];
  subCategories: string[];
  productNames: string[];
  isActive: boolean;
}

const categoryOptions = [
  'Beauty',
  'Fashion',
  'Lifestyle',
  'Fitness',
  'Food',
  'Tech',
  'Gaming',
  'Entertainment',
  'Health',
  'Home',
  'Travel',
  'DIY',
  'Education',
  'Music'
];

const subCategoryMap: Record<string, string[]> = {
  Beauty: ['Makeup', 'Skincare', 'Hair'],
  Fashion: ['Menswear', 'Womenswear', 'Accessories'],
  Lifestyle: ['Home Decor', 'Travel', 'DIY'],
  Fitness: ['Workout', 'Yoga', 'Nutrition'],
  Food: ['Recipes', 'Restaurant', 'Baking'],
  Tech: ['Gadgets', 'Software', 'Reviews'],
  Gaming: ['Console', 'PC', 'Mobile'],
  Entertainment: ['Movies', 'Music', 'Comedy'],
};

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  const { data: config, isLoading } = useQuery<BotConfig>({
    queryKey: ['/api/bot/config'],
  });

  const [formData, setFormData] = useState<BotConfig>({
    minFollowers: config?.minFollowers || 10000,
    maxFollowers: config?.maxFollowers || 1000000,
    dailyLimit: config?.dailyLimit || 500,
    actionDelay: config?.actionDelay || 45000,
    categories: config?.categories || ['Beauty', 'Fashion', 'Lifestyle'],
    subCategories: config?.subCategories || [],
    productNames: config?.productNames || [],
    isActive: config?.isActive || false,
  });

  const updateConfig = useMutation({
    mutationFn: async (data: Partial<BotConfig>) => {
      const response = await apiRequest('PUT', '/api/bot/config', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/config'] });
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "Bot configuration updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateConfig.mutate(formData);
  };

  const handleReset = () => {
    if (config) {
      setFormData(config);
      setHasChanges(false);
    }
  };

  const updateFormData = (field: keyof BotConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleCategory = (category: string) => {
    const newCategories = formData.categories.includes(category)
      ? formData.categories.filter(c => c !== category)
      : [...formData.categories, category];
    updateFormData('categories', newCategories);
  };

  const toggleSubCategory = (sub: string) => {
    const newSubs = formData.subCategories.includes(sub)
      ? formData.subCategories.filter(c => c !== sub)
      : [...formData.subCategories, sub];
    updateFormData('subCategories', newSubs);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-card border-b border-border flex items-center px-6">
          <h2 className="text-xl font-semibold text-foreground">Bot Settings</h2>
        </header>
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-5 h-5" />
          <h2 className="text-xl font-semibold text-foreground">Bot Settings</h2>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || updateConfig.isPending}
            className="bg-gradient-to-r from-tiktok-primary to-tiktok-secondary"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </header>

      {/* Settings Content */}
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* Creator Filtering */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Creator Filtering</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minFollowers">Minimum Followers</Label>
                <Input
                  id="minFollowers"
                  type="number"
                  value={formData.minFollowers}
                  onChange={(e) => updateFormData('minFollowers', parseInt(e.target.value))}
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Only invite creators with at least this many followers
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxFollowers">Maximum Followers</Label>
                <Input
                  id="maxFollowers"
                  type="number"
                  value={formData.maxFollowers}
                  onChange={(e) => updateFormData('maxFollowers', parseInt(e.target.value))}
                  min="0"
                  step="10000"
                />
                <p className="text-xs text-muted-foreground">
                  Don't invite creators with more than this many followers
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Target Categories</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categoryOptions.map((category) => (
                  <Button
                    key={category}
                    variant={formData.categories.includes(category) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleCategory(category)}
                    className={formData.categories.includes(category) ? 
                      'bg-gradient-to-r from-tiktok-primary to-tiktok-secondary' : ''
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select categories to target. Leave none selected to target all categories.
              </p>
              {formData.categories.map((cat) => (
                subCategoryMap[cat] ? (
                  <div key={cat} className="mt-2 space-y-1">
                    <Label>{cat} Subcategories</Label>
                    <div className="flex flex-wrap gap-2">
                      {subCategoryMap[cat].map((sub) => (
                        <Button
                          key={sub}
                          variant={formData.subCategories.includes(sub) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleSubCategory(sub)}
                          className={formData.subCategories.includes(sub) ? 'bg-gradient-to-r from-tiktok-primary to-tiktok-secondary' : ''}
                        >
                          {sub}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Names */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Product Names</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="productNames">Comma separated product names</Label>
            <Textarea
              id="productNames"
              value={formData.productNames.join(', ')}
              onChange={(e) =>
                updateFormData(
                  'productNames',
                  e.target.value
                    .split(',')
                    .map((n) => n.trim())
                    .filter((n) => n)
                )
              }
            />
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Rate Limiting</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dailyLimit">Daily Invitation Limit</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  value={formData.dailyLimit}
                  onChange={(e) => updateFormData('dailyLimit', parseInt(e.target.value))}
                  min="1"
                  max="10000"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum invitations to send per day
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="actionDelay">Action Delay (seconds)</Label>
                <Input
                  id="actionDelay"
                  type="number"
                  value={Math.round(formData.actionDelay / 1000)}
                  onChange={(e) => updateFormData('actionDelay', parseInt(e.target.value) * 1000)}
                  min="10"
                  max="300"
                />
                <p className="text-xs text-muted-foreground">
                  Delay between actions to appear human-like
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Bot Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Bot Active</h4>
                <p className="text-sm text-muted-foreground">
                  Enable bot to start processing invitations
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => updateFormData('isActive', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Configuration Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Followers:</span>
                <span className="font-medium">
                  {formData.minFollowers.toLocaleString()} - {formData.maxFollowers.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Daily Limit:</span>
                <span className="font-medium">{formData.dailyLimit}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Delay:</span>
                <span className="font-medium">{formData.actionDelay / 1000}s</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {formData.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Categories: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
              {formData.subCategories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.subCategories.map((sub) => (
                    <Badge key={sub} variant="secondary" className="text-xs">
                      {sub}
                    </Badge>
                  ))}
                </div>
              )}
              {formData.productNames.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.productNames.map((name) => (
                    <Badge key={name} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}