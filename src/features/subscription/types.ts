export type SubscriptionPlanId = "monthly" | "yearly";

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface ScanQuotaData {
  tier: "FREE" | "PRO";
  used: number;
  max: number | null;
  remaining: number | null;
  isPro: boolean;
}
