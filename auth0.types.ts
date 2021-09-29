export interface PatchUsersByIdBody {
  blocked?: boolean;
  "email_verified"?: boolean;
  email?: string;
  "phone_number"?: string;
  "phone_verified"?: boolean;
  "user_metadata"?: Record<string, string | number>;
  "app_metadata"?: Record<string, string | number>;
  "given_name"?: string;
  "family_name"?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  "verify_email"?: boolean;
  "verify_phone_number"?: boolean;
  password?: string;
  connection?: string;
  "client_id"?: string;
  username?: string;
}

export interface GetOrganizationsResponse {
  id: string;
  name: string;
  "display_name": string;
  branding?: {
    "logo_url": string;
    colors: Record<string, string>
  };
  metadata: Record<string, string>
}

export interface GetUsersByIdResponse {
  "created_at": string;
  "email": string;
  "email_verified": boolean;
  "identities": [
    {
      "user_id": string;
      "provider": string;
      "connection": string;
      "isSocial": boolean;
    }
  ],
  "name": string;
  "nickname": string;
  "picture": string;
  "updated_at": string;
  "user_id": string;
  "user_metadata": Record<string, string>;
  "app_metadata": Record<string, string>;
  "last_ip": string;
  "last_login": string;
  "logins_count": number;
}

export interface PatchOrganizationsByIdBody {
  "display_name": string;
  "name": string;
  "branding"?: {
    "logo_url": string;
    "colors": Record<string, string>;
  };
  "metadata": Record<string, string>
}
