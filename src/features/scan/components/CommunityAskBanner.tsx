"use client";

import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TkRevealClient from "@/components/shared/tk-reveal-client";

interface CommunityAskBannerProps {
  onAskCommunity: () => void;
  badgeLabel: string;
  subLabel: string;
  title: string;
  description: string;
  buttonLabel: string;
}

export function CommunityAskBanner({
  onAskCommunity,
  badgeLabel,
  subLabel,
  title,
  description,
  buttonLabel,
}: CommunityAskBannerProps) {
  return (
    <TkRevealClient>
      <div className="rounded-2xl border border-primary/25 bg-card p-6 sm:p-7 shadow-xs transition-colors hover:border-primary/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {badgeLabel}
              </span>
              <span>•</span>
              <span>{subLabel}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
          <Button
            onClick={onAskCommunity}
            className="btn-cta rounded-full px-6 py-5 text-sm font-semibold shrink-0 cursor-pointer shadow-sm flex items-center gap-2 self-start sm:self-center"
          >
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            <span>{buttonLabel}</span>
          </Button>
        </div>
      </div>
    </TkRevealClient>
  );
}
