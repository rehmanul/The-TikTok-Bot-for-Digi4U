import axios, { AxiosInstance } from 'axios';
import { ActivityLogger } from '../bot/activity-logger';

export interface TikTokCreator {
  id: string;
  username: string;
  display_name: string;
  follower_count: number;
  is_verified: boolean;
  bio_description?: string;
  profile_image?: string;
  category?: string;
  engagement_rate?: number;
}

export interface TikTokAPIConfig {
  appId: string;
  appSecret: string;
  accessToken?: string;
  redirectUri: string;
}

export interface CreatorSearchParams {
  category?: string;
  min_followers?: number;
  max_followers?: number;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface InvitationRequest {
  creator_id: string;
  campaign_id?: string;
  message?: string;
  commission_rate?: number;
}

export class TikTokAPIService {
  private client: AxiosInstance;
  private config: TikTokAPIConfig;
  private activityLogger: ActivityLogger;

  constructor(config: TikTokAPIConfig) {
    this.config = config;
    this.activityLogger = new ActivityLogger();

    this.client = axios.create({
      baseURL: 'https://business-api.tiktok.com/open_api/v1.3',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': config.accessToken || ''
      },
      timeout: 30000
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`TikTok API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('TikTok API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        if (response.data.code !== 0) {
          throw new Error(`TikTok API Error: ${response.data.message} (Code: ${response.data.code})`);
        }
        return response;
      },
      (error) => {
        console.error('TikTok API Response Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate OAuth authorization URL for TikTok Business API
   */
  generateAuthUrl(state?: string): string {
    return 'https://www.tiktok.com/v2/auth/authorize?client_key=7512649815700963329&scope=user.info.basic%2Cbiz.creator.info%2Cbiz.creator.insights%2Cvideo.list%2Ctcm.order.update%2Ctto.campaign.link&response_type=code&redirect_uri=https%3A%2F%2Fseller-uk-accounts.tiktok.com%2Faccount%2Fregister';
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(authCode: string): Promise<string> {
    try {
      const response = await axios.post('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
        app_id: this.config.appId,
        secret: this.config.appSecret,
        auth_code: authCode
      });

      if (response.data.code === 0) {
        const accessToken = response.data.data.access_token;
        this.config.accessToken = accessToken;
        this.client.defaults.headers['Access-Token'] = accessToken;

        await this.activityLogger.logBotAction('oauth_token_obtained', undefined, undefined, {
          success: true,
          expires_in: response.data.data.expires_in
        });

        return accessToken;
      } else {
        throw new Error(`Failed to obtain access token: ${response.data.message}`);
      }
    } catch (error) {
      await this.activityLogger.logError(error as Error, 'oauth_token_exchange');
      throw error;
    }
  }

  /**
   * Search for creators using TikTok Creator Marketplace API
   */
  async searchCreators(params: CreatorSearchParams): Promise<TikTokCreator[]> {
    try {
      const response = await this.client.get('/creator/search/', {
        params: {
          category: params.category,
          min_followers: params.min_followers || 1000,
          max_followers: params.max_followers || 1000000,
          location: params.location || 'GB',
          limit: params.limit || 20,
          offset: params.offset || 0
        }
      });

      const creators = response.data.data.creators.map((creator: any) => ({
        id: creator.creator_id,
        username: creator.username,
        display_name: creator.display_name,
        follower_count: creator.follower_count,
        is_verified: creator.is_verified,
        bio_description: creator.bio_description,
        profile_image: creator.avatar_url,
        category: creator.category,
        engagement_rate: creator.engagement_rate
      }));

      await this.activityLogger.logBotAction('creators_searched', undefined, undefined, {
        found: creators.length,
        params
      });

      return creators;
    } catch (error) {
      await this.activityLogger.logError(error as Error, 'creator_search', params);
      throw error;
    }
  }

  /**
   * Get detailed creator information
   */
  async getCreatorDetails(creatorId: string): Promise<TikTokCreator | null> {
    try {
      const response = await this.client.get(`/creator/info/`, {
        params: { creator_id: creatorId }
      });

      if (response.data.data) {
        const creator = response.data.data;
        return {
          id: creator.creator_id,
          username: creator.username,
          display_name: creator.display_name,
          follower_count: creator.follower_count,
          is_verified: creator.is_verified,
          bio_description: creator.bio_description,
          profile_image: creator.avatar_url,
          category: creator.category,
          engagement_rate: creator.engagement_rate
        };
      }
      return null;
    } catch (error) {
      await this.activityLogger.logError(error as Error, 'get_creator_details', { creatorId });
      return null;
    }
  }

  /**
   * Send collaboration invitation to creator
   */
  async sendInvitation(invitation: InvitationRequest): Promise<boolean> {
    try {
      const response = await this.client.post('/creator/invitation/send/', {
        creator_id: invitation.creator_id,
        campaign_id: invitation.campaign_id,
        message: invitation.message || 'Join our affiliate program and earn commissions!',
        commission_rate: invitation.commission_rate || 0.1
      });

      if (response.data.code === 0) {
        await this.activityLogger.logBotAction('invitation_sent', undefined, undefined, {
          creator_id: invitation.creator_id,
          success: true,
          invitation_id: response.data.data.invitation_id
        });
        return true;
      } else {
        await this.activityLogger.logBotAction('invitation_failed', undefined, undefined, {
          creator_id: invitation.creator_id,
          error: response.data.message
        });
        return false;
      }
    } catch (error) {
      await this.activityLogger.logError(error as Error, 'send_invitation', invitation);
      return false;
    }
  }

  /**
   * Get invitation status and history
   */
  async getInvitationHistory(limit: number = 50): Promise<any[]> {
    try {
      const response = await this.client.get('/creator/invitation/list/', {
        params: { limit, offset: 0 }
      });

      return response.data.data.invitations || [];
    } catch (error) {
      await this.activityLogger.logError(error as Error, 'get_invitation_history');
      return [];
    }
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignMetrics(campaignId?: string): Promise<any> {
    try {
      const response = await this.client.get('/campaign/metrics/', {
        params: { campaign_id: campaignId }
      });

      return response.data.data;
    } catch (error) {
      await this.activityLogger.logError(error as Error, 'get_campaign_metrics');
      return null;
    }
  }

  /**
   * Validate current access token
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.client.get('/advertiser/info/');
      return response.data.code === 0;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Update access token
   */
  updateAccessToken(token: string): void {
    this.config.accessToken = token;
    this.client.defaults.headers['Access-Token'] = token;
  }

  /**
   * Get API client configuration
   */
  getConfig(): TikTokAPIConfig {
    return { ...this.config, appSecret: '***' }; // Hide secret
  }
}

export default TikTokAPIService;