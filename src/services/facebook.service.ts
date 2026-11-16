import { getPathIdAsStr } from '@helpers/get-path-id';
import { rcWindow } from '@stores/window.store';

/** The field of the backend's Facebook connection that `mapFacebookTokenInitUrl` reads. */
export type FacebookTokenInitSettings = {
  facebookTokenConnectFlowInitUrl?: string | null;
};

export const FACEBOOK_BASE_SCOPES = [
  'pages_manage_metadata',
  'pages_show_list',
  'pages_manage_posts',
  'pages_read_engagement',
  'pages_read_user_content',
  'pages_manage_engagement',
];

export type FacebookPageType = {
  id: string;
  category: string;
  name: string;
  access_token: string;
  link?: string;
  website?: string;
  single_line_address?: string;
  cover?: {
    cover_id: string;
    offset_x: number;
    offset_y: number;
    source: string;
    id: string;
  } | null;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
};

export type FacebookPagesResponse = {
  data?: FacebookPageType[] | null;
  paging: {
    cursors: {
      before: string;
      after: string;
    };
  };
};

export type FacebookProfileResponse = {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
};

export class BaseFacebookService {
  protected _FB: facebook.FacebookStatic;
  protected scopes = FACEBOOK_BASE_SCOPES;
}

/**
 * A wrapper class over Facebook Graph API SDK
 *
 * - We transform callbacks into promises, and we chain what we need
 * - To be used after Facebook initialization, see useFacebookSdk in use-facebook-sdk.ts
 */
export class FacebookService extends BaseFacebookService {
  /**
   * Getter class, so we do not work with the window object
   */
  get FB(): facebook.FacebookStatic {
    // GET FB (facebook SDK from window if it does not exist)
    if (this._FB) {
      return this._FB;
    }

    this._FB = rcWindow.FB;
    return rcWindow.FB;
  }

  /**
   * Get Scopes
   */
  getScopes(): string[] {
    return this.scopes;
  }

  /**
   * Wrap login callback in a promise and pass scopes
   */
  doLogin(): Promise<facebook.StatusResponse | null> {
    return new Promise((resolve) => {
      this.FB.login(
        (response) => {
          if (response) {
            resolve(response);
          } else {
            resolve(null);
          }
        },
        {
          scope: this.scopes.join(','),
        },
      );
    });
  }

  /**
   * Wrap check status in a promise
   */
  getLoginStatus(): Promise<facebook.StatusResponse | null> {
    return new Promise((resolve) => {
      this.FB.getLoginStatus((response) => {
        if (response) {
          resolve(response);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Helper class to extract token from login status
   */
  async getToken(): Promise<string | null> {
    const loginResponse = await this.getLoginStatus();
    if (loginResponse) {
      return loginResponse?.authResponse?.accessToken ?? null;
    }

    return null;
  }

  /**
   * Wrap logout in a promise
   * logout on facebook but keep in mind we should also remove the token from our database when logging out
   */
  async logout(): Promise<null> {
    const token = await this.getToken();
    if (token) {
      return new Promise((resolve) => {
        this.FB.logout(() => {
          resolve(null);
        });
      });
    }

    return null;
  }

  /**
   * Wrap get Pages in a promise
   * this also requests a login with scopes if the user is not logged in
   */
  async getPages(): Promise<FacebookPagesResponse | null> {
    let token = await this.getToken();
    if (!token) {
      await this.doLogin();
      token = await this.getToken();
    }

    if (token) {
      return new Promise((resolve) => {
        FB.api(
          '/me/accounts',
          'get',
          {
            access_token: token,
            fields: 'id,category,name,access_token,website,contact_address,single_line_address,cover,picture,link',
          },
          (response: FacebookPagesResponse) => {
            resolve(response);
          },
        );
      });
    }

    return null;
  }

  /**
   * Wrap get Profile in a promise
   * this also requests a login with scopes if the user is not logged in
   */
  async getProfile(): Promise<FacebookProfileResponse | null> {
    let token = await this.getToken();
    if (!token) {
      await this.doLogin();
      token = await this.getToken();
    }
    if (token) {
      return new Promise((resolve) => {
        FB.api(
          '/me',
          'get',
          {
            access_token: token,
            fields: 'id,name,first_name,last_name,picture',
          },
          (response) => {
            resolve(response as FacebookProfileResponse);
          },
        );
      });
    }
    return null;
  }

  mapFacebookTokenInitUrl(settings: FacebookTokenInitSettings) {
    let facebookTokenInitUrl = settings.facebookTokenConnectFlowInitUrl;

    if (facebookTokenInitUrl === undefined) {
      console.error('Facebook Token Init URL is not defined', settings);
      facebookTokenInitUrl =
        'https://www.rankingcoach.com/app/api/client/presence/locations/{locationId}/facebook/token/init'.replace(
          '{locationId}',
          getPathIdAsStr(),
        );
    }

    return facebookTokenInitUrl;
  }
}

export const facebookService = new FacebookService();
