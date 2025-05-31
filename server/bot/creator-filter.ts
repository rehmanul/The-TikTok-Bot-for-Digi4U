import { storage } from '../storage';
import type { Creator, BotConfig } from '@shared/schema';

export class CreatorFilter {
  async filterCreators(creators: any[], config: BotConfig): Promise<Creator[]> {
    const filtered: Creator[] = [];

    for (const creatorData of creators) {
      try {
        // Parse follower count
        const followers = this.parseFollowerCount(creatorData.followers);
        
        // Check if within follower range
        const min = config.minFollowers ?? 0;
        const max = config.maxFollowers ?? Number.MAX_SAFE_INTEGER;
        if (followers < min || followers > max) {
          continue;
        }

        // Check category filter
        if (config.categories && config.categories.length > 0) {
          const creatorCategory = creatorData.category?.toLowerCase() || '';
          const matchesCategory = config.categories.some(cat => 
            creatorCategory.includes(cat.toLowerCase())
          );
          
          if (!matchesCategory) {
            continue;
          }
        }

        // Check if creator already exists
        let existingCreator = await storage.getCreatorByUsername(creatorData.username);
        
        if (!existingCreator) {
          // Create new creator
          existingCreator = await storage.createCreator({
            username: creatorData.username,
            followers,
            category: creatorData.category,
            inviteStatus: 'pending',
          });
        } else {
          // Update existing creator info
          await storage.updateCreator(existingCreator.id, {
            followers,
            category: creatorData.category,
          });
        }

        // Check if eligible for invitation
        const isEligible = await this.isEligibleForInvitation(existingCreator);
        if (isEligible) {
          filtered.push(existingCreator);
        }

      } catch (error) {
        console.error(`Error processing creator ${creatorData.username}:`, error);
        continue;
      }
    }

    return filtered;
  }

  private parseFollowerCount(followersText: string): number {
    if (!followersText) return 0;

    // Remove non-numeric characters except K, M, B
    const cleaned = followersText.replace(/[^\d.KMB]/gi, '').toUpperCase();
    
    let multiplier = 1;
    let numStr = cleaned;

    if (cleaned.includes('K')) {
      multiplier = 1000;
      numStr = cleaned.replace('K', '');
    } else if (cleaned.includes('M')) {
      multiplier = 1000000;
      numStr = cleaned.replace('M', '');
    } else if (cleaned.includes('B')) {
      multiplier = 1000000000;
      numStr = cleaned.replace('B', '');
    }

    const number = parseFloat(numStr) || 0;
    return Math.round(number * multiplier);
  }

  private async isEligibleForInvitation(creator: Creator): Promise<boolean> {
    // Don't invite if already accepted
    if (creator.inviteStatus === 'accepted') {
      return false;
    }

    // Don't invite if invited within last 24 hours
    if (creator.lastInvited) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (creator.lastInvited > oneDayAgo) {
        return false;
      }
    }

    // Don't invite if rejected recently (within 7 days)
    if (creator.inviteStatus === 'rejected' && creator.lastInvited) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (creator.lastInvited > sevenDaysAgo) {
        return false;
      }
    }

    return true;
  }

  async categorizeCreator(username: string, bio?: string, recentPosts?: string[]): Promise<string> {
    // Simple categorization based on keywords
    const text = `${username} ${bio || ''} ${recentPosts?.join(' ') || ''}`.toLowerCase();

    const categories = {
      'Beauty': ['beauty', 'makeup', 'skincare', 'cosmetic', 'lipstick', 'foundation'],
      'Fashion': ['fashion', 'style', 'outfit', 'clothing', 'dress', 'shoes', 'accessories'],
      'Fitness': ['fitness', 'workout', 'gym', 'health', 'exercise', 'yoga', 'muscle'],
      'Lifestyle': ['lifestyle', 'daily', 'life', 'routine', 'home', 'family', 'travel'],
      'Food': ['food', 'cooking', 'recipe', 'chef', 'kitchen', 'meal', 'restaurant'],
      'Tech': ['tech', 'technology', 'gadget', 'phone', 'computer', 'review', 'unboxing'],
      'Gaming': ['gaming', 'game', 'gamer', 'xbox', 'playstation', 'pc', 'mobile'],
      'Entertainment': ['entertainment', 'funny', 'comedy', 'music', 'dance', 'viral'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'General';
  }

  async getRecommendedCreators(limit: number = 10): Promise<Creator[]> {
    const config = await storage.getBotConfig();
    if (!config) {
      throw new Error('Bot configuration not found');
    }

    // Get creators who haven't been invited recently and match criteria
    const allCreators = await storage.getCreatorsForInvitation(limit * 2);
    
    // Sort by follower count and engagement potential
    const sortedCreators = allCreators.sort((a, b) => {
      // Prefer creators with moderate follower counts (better engagement rates)
      const aScore = this.calculateCreatorScore(a, config);
      const bScore = this.calculateCreatorScore(b, config);
      return bScore - aScore;
    });

    return sortedCreators.slice(0, limit);
  }

  private calculateCreatorScore(creator: Creator, config: BotConfig): number {
    if (!creator.followers) return 0;

    const followers = creator.followers;
    const minFollowers = config.minFollowers || 1000;
    const maxFollowers = config.maxFollowers || 1000000;

    // Sweet spot is around 25% of the way from min to max
    const optimalFollowers = minFollowers + (maxFollowers - minFollowers) * 0.25;
    
    // Score based on how close to optimal
    const followerScore = 1 - Math.abs(followers - optimalFollowers) / maxFollowers;
    
    // Bonus for specific categories
    let categoryBonus = 0;
    if (config.categories && config.categories.includes(creator.category || '')) {
      categoryBonus = 0.2;
    }

    // Penalty for recent rejections
    let rejectionPenalty = 0;
    if (creator.inviteStatus === 'rejected') {
      rejectionPenalty = 0.3;
    }

    return Math.max(0, followerScore + categoryBonus - rejectionPenalty);
  }
}
