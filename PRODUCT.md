# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
HTML generated at build time from JavaScript templates and editable data, CSS, vanilla JavaScript. A Node.js server provides account and request APIs. Static hosting publishes the compiled HTML and assets.

## Users
Russian-speaking business owners, marketers, musicians and individuals ordering design, marketplace imagery and animation.

## Product Purpose
Present Nikolay Parfenkov's graphic design services, supplied portfolio work and illustrative service examples, and let visitors submit a specific request.

## Positioning
Nikolay Parfenkov is a graphic designer who primarily develops the design himself and communicates directly with customers. Supplied work and demonstration examples share one public gallery with neutral copy. Provenance remains in source data and maintenance documentation; supplied work does not imply a confirmed commercial commission, and examples are not attributed as his commissions.

## Operating Context
This project owns its interface, routes, content configuration, user storage and sessions. Published preview: https://designway3.netlify.app/. Deployment follows the user's authorization for this repository.

## Capabilities and Constraints
16 services and 29 portfolio entries: 10 supplied projects using 25 original images and 19 demonstration examples. Both pages use the same ordered collection, supplied projects first and examples next. The homepage shows eight entries per page over four pages, with five on the last page and eight already visible in the built HTML; /portfolio/ shows all 29 entries immediately. Changing category returns to page one and recalculates page count; a single page hides pagination. Previous/next and numbered buttons have 44px targets, a current-page state and a visible item range. On mobile, the numbered row follows the arrows and range. Page changes transfer focus and scroll to the gallery heading; reduced motion uses instant scrolling. Viewer navigation follows the current homepage page or the visible filtered collection on /portfolio/. Six category controls remain visible, including “Все направления”; filtering and viewer navigation use the combined visible collection. Public headings are “От упаковки до обложки: примеры дизайна” on the homepage and “Дизайн в деталях” on /portfolio/. There are no public origin selections, notes or badges. The festival project contains 10 images and the education journal contains seven, with a horizontal thumbnail strip and material counter. The homepage shows each project with its task; /portfolio/ expands it into task, solution and materials. /about/ introduces the designer using confirmed facts and his actual supplied portrait, also used on the homepage. Approved biography paragraphs remain optional configuration; no biography, retouched portrait or professional claims are invented. Original portfolio compositions and lettering are preserved. Filters, image/video viewing and before/after comparison share the existing interaction model. Video previews loop silently in visible cards with pause controls. The delivery animation contains no audio; the music example includes an original instrumental track. Full players start by user action. Request forms preserve the selected service and require an explicit successful API acknowledgement. Accounts include registration, sign-in, profile editing, password change and logout. API hosting, webhook delivery, real contact details and business registration data are configured separately. Do not invent reviews, clients, results, prices or guarantees. Keep service readiness and implementation notes in documentation, not public form disclaimers.

## Evidence on Hand
Product data lives in src/config.mjs, src/content.mjs, src/project-stories.mjs, src/new-offerings.mjs and src/additional-projects.mjs. The six additional demonstrations are interleaved with all thirteen previous examples through src/content.mjs on both gallery pages. On 27 October 2026, 25 of 30 supplied work images were selected into 10 projects in src/client-projects.mjs with kind: 'provided'; none is marked kind: 'client'. src/designer-assets.json records the 25 portfolio originals; assets-original/designer/ holds these and the actual portrait. scripts/designer-assets.mjs produces 78 WebP files and 78 adjacent provenance JSON files without upscaling. src/designer-pages.mjs implements the designer page; src/homepage-sections.mjs supplies the homepage and detailed portfolio gallery. scripts/build.mjs assembles eleven HTML pages with shared navigation and footer. Other UI implementation is in public/. Content integration is documented in docs/portfolio-content.md. Asset prompts and production details live in docs/image-prompts.md, src/service-art.json, docs/expanded-portfolio-assets.md and docs/additional-portfolio-assets.md. The latest local validation passed all 37 tests, build and eleven-page checks, including eight initially visible homepage entries versus all 29 on /portfolio/. Three current pagination screenshots at 320/768/1440px are in .impeccable/review/gallery-eight/. Four earlier screenshots in .impeccable/review/gallery-pagination/ record the previous six-entry pagination. Earlier unified-gallery evidence is in .impeccable/review/unified-gallery/; portrait and material evidence remains in .impeccable/review/final-real/. Publication of an updated build must be verified separately.

## Brand Commitments
Clear Russian copy, terracotta #753b29, dark brown #2d1c15, cream #f5eee5, local Onest, full-width hero scene, asymmetric gallery and open catalogue rows. The logo uses a filled geometric Cyrillic C and a detached diamond. Preserve the approved visual system and structure.

## Accessibility & Inclusion
Responsive layout from 320px, semantic HTML, keyboard controls, visible focus, reduced-motion alternatives, accessible labels and form validation.
