# О дизайнере и портфолио

Mode: Read for /about/, Experience for /portfolio/.

Established world: inherit DESIGN.md. Terracotta, cream, dark brown, local Onest, open rows and restrained controls. This is a local extension, with no replacement visual identity or generated portrait.

FIRST VIEWPORT: /about/ pairs Nikolay Parfenkov's full name, profession, short introduction and actions with his supplied real portrait through site.coordinator.photo and photoSrcset. CSS crops the image without retouching it. Three compact line icons describe direct communication, his own design work and file preparation. On mobile the image follows the name and profession, before the introduction and actions. /portfolio/ leads with an editorial title, a concise explanation, selection controls for supplied work and demonstrations, and category filters. Both have direct navigation back to services and requests.

Structure: designer introduction with actual portrait → direct conversation → design purposes illustrated with supplied works → direct collaboration → request. Portfolio: selection and category filters → illustrated task/solution/materials rows → request. Desktop portfolio rows alternate image and text; mobile keeps the image before its explanation.

Interaction: existing project viewer, before/after control, muted video previews, native full video playback, filters and selected-service order form. The same 29-project content module powers the homepage and portfolio. Both default to 10 supplied works, with 19 demonstrations in a separate selection. Empty categories are hidden; changing selection resets the category. Viewer arrows stay within visible projects. Festival and journal viewers have 10 and seven original images, a horizontal thumbnail strip and counter, reset on new project, stale-load cancellation and retry. Existing smooth page/filter/dialog transitions and reduced-motion behavior are retained.

Content boundary, 27 October 2026: 25 of 30 supplied work images form 10 projects with kind: 'provided'; a separate actual portrait is used on /about/ and the homepage. Supplied work does not confirm a commercial commission; there are no kind: 'client' entries. Detailed biography remains optional. Existing examples remain identified as demonstrations. No invented qualifications, years, clients or project results. Materials are managed through src/client-projects.mjs, src/designer-assets.json and site.coordinator; processing preserves original compositions and lettering.

Acceptance: page discoverable in desktop/mobile navigation and footer, truthful copy, functional project viewing and order selection, no overflow at 320/390/768/1265/1440px, unchanged home hero and service prices.
