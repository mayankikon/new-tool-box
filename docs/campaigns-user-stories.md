# Campaigns – User Stories for Jira

User stories derived from the campaigns feature set in the codebase. Copy into Jira as Stories (or Sub-tasks under an Epic). Adjust **As a** persona and **Acceptance criteria** to match your product and QA standards.

---

## Epic: Campaign Dashboard & List

### CAMP-001 – View campaign list with status filters
**As a** marketing manager  
**I want to** see all my campaigns in a table with name, status, audience size, channels, conversion %, and date  
**So that** I can quickly scan and find campaigns by state (active, scheduled, completed, draft).

**Acceptance criteria:**
- Table shows: Campaign name (with type icon), Status badge, Audience size, Enabled channels (SMS/Email/Push/In-app), Conversion %, and Date (launched/scheduled/created).
- Status tabs: All, Active, Scheduled, Completed, Draft; each tab shows count and filters the table.
- Row click navigates to campaign detail.
- Empty state shows “No campaigns found” when the filtered list is empty.

---

### CAMP-002 – View dashboard KPIs and metrics
**As a** marketing manager  
**I want to** see high-level KPIs (active campaigns, avg conversion rate, total reached, total revenue) on the campaigns dashboard  
**So that** I can understand overall campaign performance at a glance.

**Acceptance criteria:**
- KPI cards display: Active campaigns count, Average conversion rate, Total reached, Total revenue (with optional trend %).
- Metrics are computed from current campaign data.
- Loading state shows skeleton while data is loading.

---

### CAMP-003 – See suggested / recommended campaigns
**As a** marketing manager  
**I want to** see suggested campaigns (e.g. 30K mile service, battery health, warranty expiration) with estimated reach and revenue  
**So that** I can act on high-opportunity segments.

**Acceptance criteria:**
- Suggested campaigns show title, description, estimated reach, estimated revenue, and opportunity level (high/medium/low).
- User can navigate or use suggestion to start creating a campaign (e.g. “Create campaign” from suggestion).

---

### CAMP-004 – Dismiss smart recommendation banner
**As a** marketing manager  
**I want to** dismiss the “Smart Recommendation” banner (e.g. 30K mile service opportunity)  
**So that** my dashboard is less cluttered when I’ve already acted or am not interested.

**Acceptance criteria:**
- Banner shows a clear “Dismiss” control (e.g. X).
- On dismiss, banner is removed/hidden (state persisted per session or per user as per product decision).

---

### CAMP-005 – Empty state when no campaigns exist
**As a** marketing manager with no campaigns yet  
**I want to** see an empty state with a clear call-to-action to create my first campaign  
**So that** I know where to start.

**Acceptance criteria:**
- When campaign list is empty, empty state is shown with icon, heading (“No campaigns yet”), short description, and “Create Your First Campaign” (or similar) button.
- Button triggers the create-campaign flow (e.g. opens wizard).

---

## Epic: Create Campaign (Wizard)

### CAMP-006 – Start create campaign wizard
**As a** marketing manager  
**I want to** open a multi-step “Create Campaign” wizard from the dashboard  
**So that** I can set up a new campaign step by step.

**Acceptance criteria:**
- “Create campaign” (or equivalent) action opens the wizard; wizard has a header with “Create Campaign”, step indicator (e.g. “Step 1 of 4”), and Cancel.
- Stepper shows all steps (e.g. Setup, Audience & triggers, Message & channels, Review & launch) and allows navigating to completed steps.
- Cancel (or Back on first step) exits the wizard without saving.

---

### CAMP-007 – Step 1: Set campaign name and type (Setup)
**As a** marketing manager  
**I want to** give my campaign a name and choose a type or template (e.g. New Owner, Service Reminder, Oil Change, Battery Health, Warranty Expiration, Seasonal Promotion, Custom)  
**So that** the campaign is categorized and optionally pre-filled with sensible defaults.

**Acceptance criteria:**
- Name field is required and clearly labeled.
- User can select one campaign type; selection may load a template (name, description, category) and pre-fill later steps.
- Template picker shows name, description, and category; selection is clearly indicated.

---

### CAMP-008 – Step 2: Define audience segments
**As a** marketing manager  
**I want to** define audience segments with rules (e.g. field, operator, value) so that only the right customers receive the campaign  
**So that** messaging is targeted and relevant.

**Acceptance criteria:**
- User can add one or more segment rules; each rule has field (e.g. Purchase Date, Mileage, Battery Health, Make/Model), operator (e.g. within, equals, greater than), and value.
- Optional: AI-assisted segment creation from natural language (e.g. “customers who bought in the last 30 days”) that maps to segment rules.
- Audience size is estimated and displayed (e.g. based on rule count or backend).
- User can remove or edit segment rules.

---

### CAMP-009 – Step 2: Configure campaign trigger
**As a** marketing manager  
**I want to** set when the campaign runs (e.g. time-based, mileage, diagnostic, health, proximity, seasonal) and whether it recurs  
**So that** messages go out at the right time (e.g. 3 days after purchase, at 30K miles).

**Acceptance criteria:**
- Trigger type can be selected: time-based, mileage, diagnostic, health, proximity, seasonal.
- Time-based supports delay (e.g. days after event); other types have type-specific config (e.g. mileage threshold).
- “Recurring” toggle is available where applicable.
- Trigger selection is reflected in the wizard summary and review step.

---

### CAMP-010 – Step 3: Compose message content
**As a** marketing manager  
**I want to** write the message subject and body (for email/SMS/push/in-app) and insert personalization variables  
**So that** messages feel personalized (e.g. customer name, vehicle model, next service due).

**Acceptance criteria:**
- Subject (for email) and body fields are available; body supports multi-line text.
- User can insert personalization variables (e.g. customer_name, vehicle_model, vehicle_year, vehicle_make, mileage, next_service_due, battery_health, last_service_date, dealership_name) via a picker or syntax (e.g. {{variable}}).
- Optional: AI-generated copy from a prompt that respects variables and channel.
- Preview (e.g. device preview) shows message with sample variable values.
- **Attachments** (coupon + images) are grouped in one section below the message body on the Messages step.

---

### CAMP-011 – Step 3: Add images or video to message
**As a** marketing manager  
**I want to** attach images or video to the campaign message  
**So that** creative (e.g. service offer graphic, short video) is included in the message.

**Acceptance criteria:**
- User can upload one or more image/video attachments.
- For video, a short preview (e.g. GIF) may be shown in the UI.
- Attachments are listed with name, size, type; user can remove attachments.
- Image/video controls live under **Attachments** alongside the coupon row on the Messages step.

---

### CAMP-012 – Step 3: Select and configure channels
**As a** marketing manager  
**I want to** choose which channels (SMS, Email, Push, In-app) to use and see estimated reach per channel  
**So that** I can balance reach and cost across channels.

**Acceptance criteria:**
- User can enable/disable each channel (SMS, Email, Push, In-app).
- Per-channel estimated reach is shown when channel is enabled.
- Message content (subject/body) can be edited with channel-specific preview (e.g. SMS vs email vs push).
- At least one channel must be enabled to proceed (enforced at validation or review step).

---

### CAMP-013 – Step 4: Review and launch campaign
**As a** marketing manager  
**I want to** review a summary of setup, audience, trigger, message, and channels before launching  
**So that** I can correct mistakes and confirm before going live.

**Acceptance criteria:**
- Review step shows: campaign name and type, audience segments and size, trigger, message content (with variable preview), enabled channels, and estimated reach/appointments/revenue.
- User can jump back to a specific step (e.g. via stepper or “Edit” links) to change details.
- “Launch” (or “Schedule”) action submits the campaign; success returns to dashboard or detail with appropriate status (e.g. active/scheduled/draft).
- Optional: choice to “Save as draft” without launching.

---

## Epic: Campaign Detail & Management

### CAMP-014 – View campaign detail (overview)
**As a** marketing manager  
**I want to** open a campaign from the list and see its overview (name, status, type, audience, trigger, messages, channels, key metrics)  
**So that** I can understand what the campaign does and how it’s configured.

**Acceptance criteria:**
- Detail view has a header with campaign name, status badge, and actions (Back, Pause/Resume, Edit, Delete as applicable).
- Overview tab shows: type, audience segments and size, trigger, message summary, enabled channels, and key metrics (e.g. reach, response rate, conversion rate, revenue, appointments).

---

### CAMP-015 – View campaign analytics
**As a** marketing manager  
**I want to** see performance metrics (reach, open rate, engagement, conversion, revenue, appointments) and optionally by channel  
**So that** I can evaluate campaign effectiveness.

**Acceptance criteria:**
- Analytics tab shows metrics such as: Reach, Open rate, Engagement rate, Response rate, Conversion rate, Revenue, Appointments.
- Optional: breakdown or bars by channel (SMS, Email, Push, In-app).
- Trends (e.g. up/down) can be shown where applicable.

---

### CAMP-016 – View campaign audience
**As a** marketing manager  
**I want to** see the audience segments and audience size for the campaign  
**So that** I can verify who was targeted.

**Acceptance criteria:**
- Audience tab lists segment rules (field, operator, value) and total audience size.
- Display is read-only and consistent with how segments were defined in the wizard.

---

### CAMP-017 – View campaign message and channels
**As a** marketing manager  
**I want to** see the message content (subject, body) and which channels are enabled  
**So that** I can confirm what was sent and where.

**Acceptance criteria:**
- Message tab shows subject (if applicable) and body for each channel; enabled channels are clearly indicated.
- Personalization variables may be shown as placeholders or with sample values for clarity.

---

### CAMP-018 – Pause and resume campaign
**As a** marketing manager  
**I want to** pause an active campaign or resume a paused one  
**So that** I can temporarily stop delivery without deleting the campaign.

**Acceptance criteria:**
- For status “Active”, a “Pause” action is available (header and/or row actions).
- For status “Paused”, a “Resume” action is available.
- After pause, status becomes “Paused”; after resume, status becomes “Active” (or equivalent per product).
- UI updates to reflect new status and available actions.

---

### CAMP-019 – Edit campaign
**As a** marketing manager  
**I want to** edit a campaign that is not completed (e.g. draft, scheduled, paused)  
**So that** I can fix configuration or messaging before or during the run.

**Acceptance criteria:**
- “Edit” is available for non-completed campaigns (e.g. draft, scheduled, active, paused); optionally hidden or disabled for “completed”.
- Edit opens the same or a similar flow as create (e.g. wizard or inline forms) with existing values pre-filled.
- Saving updates the campaign and returns to detail or list with updated data.

---

### CAMP-020 – Delete campaign
**As a** marketing manager  
**I want to** delete a campaign (with confirmation)  
**So that** I can remove drafts or obsolete campaigns.

**Acceptance criteria:**
- “Delete” action is available (e.g. in detail header and table row dropdown).
- A confirmation dialog (or equivalent) is shown before delete.
- On confirm, campaign is removed and user is returned to dashboard/list; list no longer shows the deleted campaign.

---

## Epic: Campaign Types & Templates

### CAMP-021 – Use predefined campaign types
**As a** marketing manager  
**I want to** choose from predefined campaign types (e.g. Service Reminder, New Owner Onboarding, Lease Renewal, Vehicle Trade-In, Warranty Expiration, Recall, Custom)  
**So that** I get consistent naming and optional defaults.

**Acceptance criteria:**
- Types are listed in the Setup step (or equivalent) with clear labels and optional icons.
- Selecting a type may set or suggest template defaults for audience, trigger, and message.
- “Custom” allows fully manual setup without template defaults.

---

### CAMP-022 – Use campaign templates
**As a** marketing manager  
**I want to** start from a template (name, description, category) that pre-fills audience, trigger, message(s), or channels  
**So that** I can launch common campaigns faster.

**Acceptance criteria:**
- Templates are selectable in the wizard (e.g. Setup step); each has name, description, and category.
- Selecting a template pre-fills relevant wizard steps (e.g. audience rules, trigger, message copy, channels).
- Templates may define a **multi-message sequence** (e.g. New Owner Onboarding: 3 messages at Day 1, Day 7, Day 30); the wizard shows all messages with delay labels and allows editing each before launch.
- User can override any pre-filled value before launch.

---

## Epic: Audience & Compliance Enhancements (implemented)

### CAMP-027 – Exclusion rules
**As a** marketing manager  
**I want to** define exclusion rules (e.g. contacted in last 7/14/30 days, has appointment, opted out of SMS/Email/marketing, in active campaign)  
**So that** I avoid contacting the wrong customers and respect opt-outs.

**Acceptance criteria:**
- Step 2 (Audience & Triggers) has an Exclusions subsection with add/remove/edit exclusion rules.
- Exclusion field types and value options are provided (e.g. days, Yes for appointment/opt-out).
- Audience size estimate reflects exclusions (e.g. “after exclusions” in badge and review step).

---

### CAMP-028 – Win-back and at-risk segment presets
**As a** marketing manager  
**I want to** apply one-click segment presets (e.g. No visit 12/18/24 months, Last visit recall-only, High mileage no recent service)  
**So that** I can target win-back and at-risk customers quickly.

**Acceptance criteria:**
- Step 2 shows “Quick segments” with preset chips; clicking one appends that preset’s segment rules to the audience.

---

### CAMP-029 – Suggested campaigns carousel
**As a** marketing manager  
**I want to** browse multiple smart recommendations in a carousel with prev/next  
**So that** I can choose the best opportunity and create a campaign from it.

**Acceptance criteria:**
- Dashboard shows a horizontal carousel of recommendation cards (title, description, estimated reach, revenue, opportunity badge, “Create campaign”).
- Carousel supports multiple recommendations and scroll/prev/next navigation.

---

### CAMP-030 – Schedule campaign for later
**As a** marketing manager  
**I want to** choose “Schedule for later” and set a start date/time in the Review step  
**So that** the campaign goes live automatically at that time.

**Acceptance criteria:**
- Review step has “When to launch”: Launch now vs Schedule for later; when scheduled, a datetime picker is shown.
- On complete, campaign is created with status “scheduled” and scheduledAt (and optional scheduledEndAt) set.

---

### CAMP-031 – Send time and capacity hints
**As a** marketing manager  
**I want to** see recommended send windows and shop capacity in the Review step  
**So that** I can schedule sends when the shop can handle demand.

**Acceptance criteria:**
- Review step shows “Recommended send window” (e.g. 10:00 AM – 2:00 PM) selectable from presets.
- Shop capacity hint is displayed (e.g. Normal/High; high suggests spreading sends).

---

### CAMP-032 – Channel consent and opt-out display
**As a** marketing manager  
**I want to** see per-channel reach with and without consent (e.g. “~320 (272 with consent)”)  
**So that** I understand true addressable audience.

**Acceptance criteria:**
- Step 3 and Review show estimated reach; when consent data is available, “with consent” count is shown.
- Revenue impact estimator in Review uses consent-based reach when available.

---

### CAMP-033 – Compliance checklist (TCPA/CTA)
**As a** marketing manager  
**I want to** confirm consent, opt-out, and identity requirements before launching  
**So that** we stay compliant with TCPA/CTA.

**Acceptance criteria:**
- Review step has a Compliance section with three checkboxes: consent confirmed, opt-out included, identity included.
- Launch (and Schedule) button is disabled until all three are checked.

---

## Epic: Coupon (template-based)

### CAMP-034 – Design a coupon from Message & Channels
**As a** marketing manager  
**I want to** open the coupon editor from the message step, pick a template, set discount and rules, and see live previews  
**So that** I can attach an on-brand offer without a separate design tool.

**Acceptance criteria:**
- Step 3 (**Messages**) includes an **Attachments** block with a **Coupon** row: **Attach coupon** opens a library dialog with visual previews (**`CouponCardPreview`**) and search by name; **No coupon** clears the attachment; **Create new coupon** opens the coupon editor. When a coupon is attached, the row shows a compact preview, title, value label, **Change**, **Remove**, and **Edit coupon** (opens the editor).
- **New coupon** is also available from the empty state on the coupon row.
- The coupon editor includes: template picker (6 presets), offer type / discount fields, expiration (relative days or fixed date), optional redemption caps, condition toggles, headline/subtext/CTA, badge (oil/brake/battery/tire/general/custom), accent and corner style, optional logo URL, optional urgency line, channel-safe and compliance copy.
- Saving updates **`offers`** and sets the current message’s **`offerId`**; designs stay in sync with the **Coupon** library (**`localStorage`** in the prototype).
- Device preview shows SMS, Email, Push, and **In-app** with the coupon embedded when attached.

### CAMP-035 – Review attached coupon before launch
**As a** marketing manager  
**I want to** see a compact coupon preview on the Review step  
**So that** I confirm creative and economics before launch.

**Acceptance criteria:**
- Review step shows **Attached coupon** with **`CouponCardPreview`** (compact) when the first message has an **`offerId`** that resolves to an offer in **`formData.offers`**.
- If **`offerId`** is set but the offer is missing from the library, Review shows a clear error prompting the user to return to the Messages step to fix the attachment.
- Right-hand device preview includes the same attached offer across channels when the offer resolves.

### CAMP-036 – Atlas AI suggests a coupon with the campaign
**As a** marketing manager using Atlas AI  
**I want to** see a suggested coupon on campaign recommendations and have it prefilled when I create the campaign  
**So that** intelligent offers match the audience intent (e.g. battery, oil change, win-back).

**Acceptance criteria:**
- When **`campaignSuggestion.suggestedOffer`** is present, the Atlas UI shows a **Suggested coupon** preview card.
- **Create campaign for this audience** passes the partial offer into the wizard via **`atlasSuggestedOffer`**; wizard prepends the merged offer and attaches it to message 1.

### CAMP-037 – Campaign detail Message tab shows coupon creative
**As a** marketing manager viewing a campaign  
**I want to** see the coupon card on the Message tab when messages reference an offer  
**So that** I can verify what customers will see.

**Acceptance criteria:**
- **`CampaignMessageView`** receives **`offers`** from the campaign and renders **`CouponCardPreview`** (compact) per message or channel block when **`offerId`** is set and the offer exists.

---

## Optional / Future (from codebase capabilities)

- **CAMP-023 – AI-generated audience segments:** As a marketing manager, I want to describe my audience in plain language and have segments generated, so that I don’t have to build every rule manually.
- **CAMP-024 – AI-generated message copy:** As a marketing manager, I want to provide a short prompt and have message subject/body suggested, so that I can iterate on copy quickly.
- **CAMP-026 – Duplicate campaign:** As a marketing manager, I want to duplicate an existing campaign (as draft) so that I can reuse setup with small changes.

---

## Jira tips

- Create an **Epic** (e.g. “Campaigns – Marketing”) and link these stories to it.
- Use **Components** or **Labels** such as `campaigns`, `dashboard`, `wizard`, `detail` if your board uses them.
- Add **Story points** or **Estimate** per your team’s process.
- Map **Acceptance criteria** to checklist or sub-tasks in Jira as needed.
- Adjust **As a** to your actual persona (e.g. “dealership marketing user”, “admin”).
