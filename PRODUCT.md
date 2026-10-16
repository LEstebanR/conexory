# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: the independent real estate agent in Colombia.** Works alone or nearly alone, manages their own inventory (sale, rent, furnished rent, exchange) and lives on their phone: WhatsApp with clients, Instagram for reach, visits during the day. Not technical and short on time. Their job: present a property professionally to a client fast, and know whether the client is interested. The agent is the one who signs up, adopts and pays.

**Secondary: the agent's client** (buyer or renter). Opens the property link on a phone, from WhatsApp or Instagram, without knowing what Conexory is and without an account. Their job: understand the property in seconds and contact the agent. The public listing (`/p/[slug]`) and the agent profile (`/agente/[slug]`) are designed so the agent looks good in front of this person.

Real estate agencies with several advisors are served through the Custom plan, by contact, but they are not the audience the product is designed around today.

## Product Purpose

Conexory turns each property into a public listing with its own link, ready to share on WhatsApp with a rich preview (photo, title and price). The full flow, from creating the listing to sharing it, takes under 60 seconds. The agent also gets a public profile page with all their published properties and sees how many people opened each listing.

Success means an agent publishes and shares their first listing in their first session, keeps sharing listings instead of loose photos, and upgrades to Pro when they outgrow the Free plan.

## Positioning

The competitor is a habit, not a portal: agents today send loose photos and text over WhatsApp. Conexory replaces that mess with one professional link that carries the agent's contact and tells them who opened it. A portal can't make this claim honestly, because there the client sees other agents' listings next to yours. A Conexory listing belongs only to the agent who shares it.

## Operating Context

- Agents work from the phone, between visits; the dashboard must work one-handed on mobile as well as on desktop.
- Distribution happens in WhatsApp chats and Instagram (DMs, bio link). Link previews (Open Graph images) are the first impression of the product, often before anyone opens a page.
- Clients open listings on phones of every kind, on mobile data, with no account and no patience.
- Business model: freemium. Free and Pro (monthly subscription through Mercado Pago, $99.999 COP/month) plus Custom by contact. Plan limits live in `lib/plans.ts`, the single source of truth; never restate the numbers elsewhere.
- Growth today is founder-led outreach to individual agents over Instagram and WhatsApp.

## Capabilities and Constraints

- Public property listing at `/p/[slug]`: photos, video, price, features, map and the agent's contact when the agent enables it. Never exposes internal agent data (such as the user id).
- Public agent profile at `/agente/[slug]` with filters, map and all published properties.
- Agent dashboard: create, edit, publish/deactivate, pin, share and delete properties, with per-property metrics (visits, shares, WhatsApp clicks).
- Share panel with message templates; Pro adds AI-written WhatsApp messages (Gemini). Downloadable property flyers.
- Programmatic SEO pages by city (`/propiedades/[ciudad]`) and a blog in Spanish for agents.
- Property types and operations are fixed lists in `lib/property-types.ts`. A property can be for sale, rent, furnished rent or exchange: never assume "for sale".
- Public surfaces must not keep the database awake: their reads go through the public cache (`lib/public-cache.ts`).
- All user-facing copy is in Spanish (Colombia); code and comments are in English.

## Brand Commitments

- Name: Conexory. Domain: conexory.com.
- Voice: Colombian Spanish, addressing the agent as "tú". Direct, warm and practical; talks about the agent's work (clients, visits, listings), not about technology.
- Spanish copy uses natural Spanish punctuation, never an em dash calqued from English as an aside.
- The promise "tu link en menos de 60 segundos" is the core claim and must stay true.

## Evidence on Hand

There is **no social proof yet**: no testimonials, no citable customer names or logos, no verified usage numbers. Future work must not invent testimonials, user counts, visit figures, ratings, press mentions or agency logos. Use real product screens and real listings as demonstration instead of claims.

## Product Principles

1. **The agent looks professional in front of their client.** Every public surface is the agent's storefront, not Conexory's; the agent's photos, name and contact lead.
2. **Faster than sending photos.** If a step makes creating or sharing slower than the WhatsApp habit it replaces, it doesn't belong in the flow.
3. **The link preview is the first screen.** What WhatsApp and Instagram show before the click matters as much as the page itself.
4. **No technical vocabulary.** The agent shouldn't need to know what a link preview, a slug or SEO is.
5. **Honest numbers.** Metrics and claims shown to agents or clients are real or not shown at all.
