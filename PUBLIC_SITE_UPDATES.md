# Public Website Update

The public site uses forest green, white and restrained gold accents. The admin
workspace retains its existing visual style and employee permissions.

## Implemented

- Homepage with four clear paths, property search and current catalogue images.
- No hardcoded customer counts, listing totals or unverified testimonials.
- Server-side property filtering and pagination across the complete catalogue.
- Rent and sale budgets use their respective price fields; safe locality search,
  BHK, furnishing, property type, availability and sorting are supported.
- Consistent listing cards show a short locality, specifications, price,
  availability, a stable reference and a direct WhatsApp enquiry.
- Missing/invalid listing prices show Price on request. Furniture without a
  valid price cannot be added from the public catalogue or detail view.
- Furniture detail cart selection respects the requested rent/buy mode. Removed
  unconditional no-deposit and free-installation claims.
- Admin inventory pages flag missing pricing for staff to complete.
- Service-specific quote pages send requests to existing Contact Enquiries.
- Shared contact details, call links, WhatsApp links and existing policies.
- Route and property metadata, canonical links, homepage social metadata,
  organization structured data, robots.txt and a core-pages sitemap.
- Enquiry success and call/WhatsApp events emit brokerin:lead. If a consent-managed
  dataLayer already exists, events also flow into it. No analytics vendor or
  tracking ID has been invented or enabled automatically.

## Content Follow-Up

Confirm actual inventory prices, photographs, service availability, contact
numbers and terms with the business. Similar listing names are not proof of
duplicates; compare reference numbers and units before archiving anything.
Only add customer testimonials once genuine source/permission is available.
The homepage uses current listing photography when available and a general
residential photograph if the catalogue cannot supply an image.

Client-side detail metadata improves the browser experience, but social crawlers
that do not execute JavaScript still need server rendering/prerendering for
per-property preview cards. The sitemap currently covers core and service pages;
it does not advertise private pages or invent property URLs.

Performance and conversion targets from the review are targets, not measured
results. Connect the existing consent-managed analytics to the enquiry events
and measure production performance on real devices before claiming a score.

## Verification

Frontend: CI=true npm run build; Properties.test.js and listingPresentation.test.js.
Backend: npm run typecheck; ts-node scripts/check-property-search.ts.
Browser QA covers desktop/mobile search, pagination, property metadata, quote
submission and furniture details, using intercepted test APIs. No customer emails
or production submissions are sent during QA.
