# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
HTML generated at build time from JavaScript templates and editable data, CSS, vanilla JavaScript. A Node.js server provides account and request APIs. Static hosting publishes the compiled HTML and assets.

## Users
Russian-speaking business owners, marketers, musicians and individuals ordering design, marketplace imagery and animation.

## Product Purpose
Present Nikolay Parfenkov's graphic design services, show illustrative examples and let visitors submit a specific request.

## Positioning
Nikolay Parfenkov is a graphic designer who primarily develops the design himself and communicates directly with customers. Portfolio illustrations are demonstrations, not fabricated client case studies.

## Operating Context
This project owns its interface, routes, content configuration, user storage and sessions. Published preview: https://designway3.netlify.app/. Deployment follows the user's authorization for this repository.

## Capabilities and Constraints
16 services and 19 demonstration portfolio examples. The homepage shows each example with its task; /portfolio/ expands the same examples into task, solution and materials. /about/ introduces the designer using confirmed facts. Approved biography paragraphs and a real portrait are optional configuration; no replacement portrait is generated. Filters, image/video viewing and before/after comparison share the existing interaction model. Video previews loop silently in visible cards with pause controls. The delivery animation contains no audio; the music example includes an original instrumental track. Full players start by user action. Request forms preserve the selected service and require an explicit successful API acknowledgement. Accounts include registration, sign-in, profile editing, password change and logout. API hosting, webhook delivery, real contact details and business registration data are configured separately. Do not invent reviews, clients, results, prices or guarantees. Keep service readiness and implementation notes in documentation, not public form disclaimers.

## Evidence on Hand
Product data lives in src/config.mjs, src/content.mjs, src/project-stories.mjs, src/new-offerings.mjs and src/additional-projects.mjs. The six additional demonstrations are interleaved with all thirteen previous examples through src/content.mjs on both gallery pages. src/client-projects.mjs is the shared entry point for approved original projects; it is empty as of 26 October 2026 because no commissioned work has been supplied. src/designer-pages.mjs implements the designer page; src/homepage-sections.mjs supplies the homepage and detailed portfolio gallery. scripts/build.mjs assembles eleven HTML pages with shared navigation and footer. Other UI implementation is in public/. Content integration is documented in docs/portfolio-content.md. Asset prompts and production details live in docs/image-prompts.md, src/service-art.json, docs/expanded-portfolio-assets.md and docs/additional-portfolio-assets.md. Tests and scripts/check.mjs validate the implementation.

## Brand Commitments
Clear Russian copy, terracotta #753b29, dark brown #2d1c15, cream #f5eee5, local Onest, full-width hero scene, asymmetric gallery and open catalogue rows. The logo uses a filled geometric Cyrillic C and a detached diamond. Preserve the approved visual system and structure.

## Accessibility & Inclusion
Responsive layout from 320px, semantic HTML, keyboard controls, visible focus, reduced-motion alternatives, accessible labels and form validation.
