import { StoryObj } from "@storybook/react";
import { StatusBadge } from "../StatusBadge";

export type Story = StoryObj<typeof StatusBadge>;

export const statusBadgeGetAllStates = () => [
  "danger",
  "info",
  "warning",
  "success",
  "publishing",
  "publishingStatic",
  "neutral",
  "limitExcedeed",
  "ai",
  "ado",
  "live",
  "pending_verification",
  "not_approved",
  "scheduled",
  "past",
  "published",
  "draft",
  "active",
  "paused",
  "deleted",
  "archived",
  "sent",
  "queued",
  "not_sent",
  "connected",
] as const;