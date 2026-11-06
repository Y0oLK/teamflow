export interface JwtPayload {
  sub: string; // User ID (UUID)
  email: string;
  sessionId: string; // Database Session ID
  currentOrgId?: string; // Optional Active Organization ID
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  sessionId: string;
  currentOrgId?: string;
}

export interface AuthTokens {
  accessToken: string;
  sessionId: string;
  expiresIn: number;
}
