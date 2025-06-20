import axios from 'axios';

export interface TikTokConfig {
  appId: string;
  secret: string;
  baseUrl: string;
  sandboxBaseUrl: string;
}

export interface TikTokAuthResponse {
  access_token: string;
  advertiser_ids: string[];
  scope: string[];
}

export interface CreatorProfile {
  creator_id: string;
  username: string;
  display_name: string;
  follower_count: number;
  engagement_rate: number;
  categories: string[];
  gmv_score: number;
  bio: string;
  avatar_url: string;
  verified: boolean;
}

export interface InvitationRequest {
  creator_id: string;
  campaign_id: string;
  message: string;
  collaboration_type: 'video' | 'livestream' | 'both';
  commission_rate?: number;
  product_categories: string[];
}

export interface InvitationResponse {
  invitation_id: string;
  status: 'sent' | 'pending' | 'accepted' | 'declined';
  creator_id: string;
  sent_at: string;
}

export class TikTokAPI {
  private config: TikTokConfig;
  private accessToken: string | null = null;

  constructor() {
    this.config = {
      appId: process.env.TIKTOK_APP_ID || '',
      secret: process.env.TIKTOK_SECRET || '',
      baseUrl: process.env.TIKTOK_API_BASE_URL || 'https://business-api.tiktok.com/open_api/',
      sandboxBaseUrl: process.env.TIKTOK_SANDBOX_API_BASE_URL || 'https://sandbox-ads.tiktok.com/open_api/',
    };
  }

  /**
   * Generate OAuth URL for TikTok authentication
   */
  getAuthUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_key: '7512649815700963329',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user.info.basic,biz.creator.info,biz.creator.insights,video.list,tcm.order.update,tto.campaign.link',
      state: state || 'your_custom_params'
    });

    return `https://www.tiktok.com/v2/auth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TikTokAuthResponse> {
    try {
      const response = await axios.post(`${this.config.baseUrl}oauth2/access_token/`, {
        app_id: this.config.appId,
        secret: this.config.secret,
        auth_code: code,
        redirect_uri: redirectUri
      });

      if (response.data.code === 0) {
        this.accessToken = response.data.data.access_token;
        return response.data.data;
      } else {
        throw new Error(`TikTok API Error: ${response.data.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to exchange code for token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set access token manually
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Search for creators based on filters
   */
  async searchCreators(filters: {
    minFollowers?: number;
    maxFollowers?: number;
    categories?: string[];
    region?: string;
    limit?: number;
    sortBy?: 'gmv' | 'followers' | 'engagement';
  }): Promise<CreatorProfile[]> {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    try {
      const params = {
        access_token: this.accessToken,
        min_follower_count: filters.minFollowers || 1000,
        max_follower_count: filters.maxFollowers || 1000000,
        categories: filters.categories?.join(',') || '',
        region: filters.region || 'GB',
        limit: filters.limit || 50,
        sort_by: filters.sortBy || 'gmv'
      };

      const response = await axios.get(`${this.config.baseUrl}creator/search/`, { params });

      if (response.data.code === 0) {
        return response.data.data.creators || [];
      } else {
        throw new Error(`TikTok API Error: ${response.data.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to search creators: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send collaboration invitation to creator
   */
  async sendInvitation(invitation: InvitationRequest): Promise<InvitationResponse> {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    try {
      const response = await axios.post(`${this.config.baseUrl}creator/invitation/send/`, {
        access_token: this.accessToken,
        ...invitation
      });

      if (response.data.code === 0) {
        return response.data.data;
      } else {
        throw new Error(`TikTok API Error: ${response.data.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to send invitation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get invitation status and history
   */
  async getInvitationHistory(advertiserId: string, limit: number = 50): Promise<InvitationResponse[]> {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    try {
      const response = await axios.get(`${this.config.baseUrl}creator/invitation/list/`, {
        params: {
          access_token: this.accessToken,
          advertiser_id: advertiserId,
          limit
        }
      });

      if (response.data.code === 0) {
        return response.data.data.invitations || [];
      } else {
        throw new Error(`TikTok API Error: ${response.data.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to get invitation history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignMetrics(advertiserId: string, campaignId?: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    try {
      const response = await axios.get(`${this.config.baseUrl}creator/campaign/metrics/`, {
        params: {
          access_token: this.accessToken,
          advertiser_id: advertiserId,
          campaign_id: campaignId
        }
      });

      if (response.data.code === 0) {
        return response.data.data;
      } else {
        throw new Error(`TikTok API Error: ${response.data.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to get campaign metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate current access token
   */
  async validateToken(): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    try {
      const response = await axios.get(`${this.config.baseUrl}oauth2/advertiser/get/`, {
        params: {
          access_token: this.accessToken
        }
      });

      return response.data.code === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get advertiser info
   */
  async getAdvertiserInfo(): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    try {
      const response = await axios.get(`${this.config.baseUrl}oauth2/advertiser/get/`, {
        params: {
          access_token: this.accessToken
        }
      });

      if (response.data.code === 0) {
        return response.data.data;
      } else {
        throw new Error(`TikTok API Error: ${response.data.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to get advertiser info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const tiktokAPI = new TikTokAPI();