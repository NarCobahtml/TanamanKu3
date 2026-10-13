export type AuthMode = "login" | "register";

export type AuthStep = "credentials" | "verify";

export interface PendingUserSession {
  email: string;
  name?: string;
  devOtp?: string;
}

export interface AuthFormProps {
  mode: AuthMode;
  verified?: boolean;
}
