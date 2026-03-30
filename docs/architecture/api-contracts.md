# API contracts (future backend)

This document reserves **future** HTTP/event shapes aligned with the current **mock-first** Smart Marketing UI. Nothing here is implemented as a live API in this repo yet.

## Coupons & offers

### Create or update coupon (offer)

- **Purpose**: Persist a dealership-scoped coupon definition matching **`CampaignOffer`** (`src/lib/campaigns/types.ts`): economics (`type`, `discountPercent`, `discountCents`, `valueLabel`, …), **`visual`** (`CouponVisualSpec`, including optional `vehicleImageUrl` / `vehicleCaption` from inventory catalog), **`rules`** (`CouponRules`), compliance copy, code strategy.
- **Suggested method/path**: `PUT /dealerships/{dealershipId}/marketing/coupons/{couponId}` or `POST` for create.
- **Request body** (JSON): full **`CampaignOffer`** without client-only flags, or a documented subset with the same field names for consistency with events and the app wizard.
- **Response**: persisted **`CampaignOffer`** with server-assigned `id` if created.

### List coupons

- **Suggested path**: `GET /dealerships/{dealershipId}/marketing/coupons`
- **Response**: `{ items: CampaignOffer[] }` (paginated as needed).

### Issue redemption code (per send or per customer)

- **Purpose**: Materialize **`CouponCodeStrategy`** (`single-code`, `unique-per-customer`, `barcode`, `manual`) at send time.
- **Suggested path**: `POST /dealerships/{dealershipId}/marketing/campaigns/{campaignId}/messages/{messageId}/issue-coupon-code`
- **Request**: `{ customerId: string, channel: "sms" | "email" | "push" | "in-app" }`
- **Response**: `{ code: string, expiresAt?: string, barcodeUrl?: string }`

### Redemption webhook / POS callback

- **Purpose**: Enforce **`CouponRules`** (limits, conditions, expiration) and mark **`redeemed-coupon`** for workflow goals.
- **Suggested payload** (JSON): `{ couponId, code, customerId?, vin?, redeemedAt, invoiceCents?, locationId? }`
- **Idempotency**: `Idempotency-Key` header or `redemptionId` UUID.

## Campaigns

Campaign create/update should accept optional **`offers`** and per-message **`offerId`** consistent with **`WizardSequenceMessage`** and **`Campaign`** in `types.ts`.

## Atlas AI (future)

**`AtlasAiCampaignSuggestion.suggestedOffer`** (`src/lib/atlas-ai/types.ts`) should use the same **`Partial<CampaignOffer>`** shape the UI merges today, so server-driven recommendations deserialize without a parallel schema.

## Service defection & competitive intelligence (future)

Aligned with **Monitor** mock types in `src/lib/marketing/service-defection-mock.ts` (competitor venues, defector counts, offer signals, GeoJSON zones).

### List competitor zones for a rooftop

- **Suggested path**: `GET /dealerships/{dealershipId}/marketing/service-defection/competitors`
- **Response** (JSON): `{ items: Array<{ id, name, kind, address, polygon: GeoJSON.Polygon, defectingCustomerCount30d, topServices[], promotionSummary?, estimatedAnnualRevenueAtRisk }> }`

### Aggregated KPI snapshot

- **Suggested path**: `GET /dealerships/{dealershipId}/marketing/service-defection/kpis`
- **Response**: `{ serviceDefectors30d, revenueAtRiskAnnual, competitorsTracked, winBackCampaignsActive }`

### Ingest geofence visit signal (telematics / DMS attribution)

- **Purpose**: Attribute a customer or VIN to a competitor visit for rolling 30d defector counts.
- **Suggested path**: `POST /dealerships/{dealershipId}/marketing/service-defection/visit-signals`
- **Request** (example): `{ customerId?, vin?, competitorVenueId, observedAt, source: "telematics" | "dms" | "manual" }`
- **Idempotency**: `Idempotency-Key` or server-generated `signalId`.
