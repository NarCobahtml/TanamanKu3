export type SubscriptionPlanId = "gratis" | "premium" | "annual";

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  price: string;
  amount: number;
  period: string;
  features: string[];
  buttonLabel: string;
  isCurrent: boolean;
  popular?: boolean;
}

export interface ScanQuotaData {
  tier: "FREE" | "PRO";
  used: number;
  max: number | null;
  remaining: number | null;
  isPro: boolean;
}
