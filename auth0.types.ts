export interface PatchUsersByIdBody {
  blocked?: boolean;
  "email_verified"?: boolean;
  email?: string;
  "phone_number"?: string;
  "phone_verified"?: boolean;
  "user_metadata"?: Record<string, string|number>;
  "app_metadata"?: Record<string, string|number>;
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
  metadata: Record<string, string|number>
}
