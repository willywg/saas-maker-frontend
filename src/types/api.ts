// Base API types - based on OpenAPI spec from backend

// Error response from backend
export interface ApiError {
  detail: string;
  status_code?: number;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request
export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  organization_name: string;
}

// Login/Register response
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Refresh token response
export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// User roles
export type UserRole = 'owner' | 'admin' | 'member';

// Current user response (GET /auth/me)
export interface UserResponse {
  id: string;
  email: string;
  full_name: string | null;
  email_verified: boolean;
  organization_id: string;
  organization_name: string;
  role: string;
}

// Organization response (GET /organizations/me)
export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Organization update request
export interface OrganizationUpdate {
  name?: string;
  slug?: string;
}

// Member response
export interface MemberResponse {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  joined_at: string;
}

// Invite member request
export interface InviteMemberRequest {
  email: string;
  role: string;
}

// Change role request
export interface ChangeRoleRequest {
  role: string;
}

// Invite response (returned when admin creates invite)
export interface InviteResponse {
  invite_url: string;
  token: string;
  email: string;
  role: string;
  expires_at: string;
  message: string;
}

// Invite info response (for validating token - public endpoint)
export interface InviteInfoResponse {
  email: string;
  organization_name: string;
  role: string;
  invited_by_name: string;
  expires_at: string;
}

// Accept invite request
export interface AcceptInviteRequest {
  token: string;
  full_name: string;
  password: string;
}

// Password reset
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ValidateResetTokenResponse {
  email: string;
}

// Profile management
export interface UpdateProfileRequest {
  full_name?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  // Caller's refresh token: every OTHER session gets revoked
  refresh_token?: string | null;
}

// Sessions
export interface LogoutRequest {
  refresh_token: string;
}

// Email verification
export interface VerifyEmailRequest {
  token: string;
}

// Multi-organization
export interface UserOrganizationItem {
  id: string;
  name: string;
  slug: string;
  role: string;
  is_current: boolean;
}

export interface SwitchOrganizationRequest {
  organization_id: string;
  refresh_token?: string | null;
}

export interface MessageResponse {
  message: string;
}
