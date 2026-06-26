// Common interface every integration provider implements. Phase 4 builds these
// out; for now they declare the contract so folders/files exist and are typed.
import type { VouchEvent } from "@/lib/types";

export interface IntegrationProvider {
  id: string;
  label: string;
  /** Normalise an inbound provider payload into Vouch events. */
  parseWebhook(payload: unknown): Promise<Partial<VouchEvent>[]>;
}
