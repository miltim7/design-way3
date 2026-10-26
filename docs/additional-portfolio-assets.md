# Дополнительные примеры дизайна

Шесть оригинальных демонстрационных примеров. Это не реальные заказы и не работы, предоставленные дизайнером. Использован встроенный инструмент image_gen. Надписи на изображениях — на русском языке.

Данные: `src/additional-projects.mjs`. `src/content.mjs` чередует шесть дополнительных примеров со всеми прежними 13; главная и `/portfolio/` используют общий набор из 19 демонстраций. Каталог сохраняет 16 услуг. Исходные PNG: `assets-original/portfolio/`. Готовые WebP шириной 640, 1280 и 1920: `public/assets/portfolio/` — 18 изображений и 18 соседних JSON с запросами.

Повторная оптимизация из корня проекта после `npm ci`:

```powershell
node scripts/additional-portfolio-assets.mjs
npm run build
npm run check
```

Скрипт использует `sharp` из зависимостей проекта и относительные пути; повторная генерация через image_gen не нужна. Для обычного запуска достаточно готовых медиа в репозитории.

Точные запросы сохранены в исходных PNG и отдельных `.prompt.txt`. Оптимизатор сохраняет запрос каждого изображения в соседнем `.webp.json`, чтобы происхождение оставалось доступным после повторной сборки изображений.

Каждый пример имеет отдельную задачу, описание решения, перечень материалов и связанную услугу. Они доступны в галерее главной, подробном портфолио и просмотре проекта.

Серия карточек рюкзака имеет широкий формат: `fit: 'contain'` сохраняет все три слайда целиком в галерее. Полный просмотр сохраняет изображение без обрезки.

## Запросы для изображений

### bakery-identity

Use case: product-mockup. Create one polished, photorealistic graphic design portfolio image, landscape 3:2, 1536x1024. Fictional independent bakery brand identity, distinctly burgundy, ivory and kraft paper. A beautiful designed paper bread bag is the hero, alongside a pastry box, a round seal sticker and one business card, on an ivory work surface; a single naturally baked sourdough loaf gives context. Sophisticated Russian typography, a restrained custom wheat-ear line emblem, coherent design printed on real matte packaging, realistic paper folds and soft daylight. Premium but believable small business design, strong composition with all print pieces fully in frame and typography comfortably legible. Exact Cyrillic text on packaging: "ТЁПЛЫЙ ХЛЕБ", secondary text "РЕМЕСЛЕННАЯ ПЕКАРНЯ". Repeat only these short correct words on secondary pieces. Typography is part of the actual print design, not a caption floating over the photograph. Original invented brand concept, not an existing brand or actual client. No English, gibberish, watermarks, website UI, desktop monitor, stock logo, fake signatures or excessive props. Deliver the complete clean portfolio photograph, no surrounding frame.

### architecture-identity

Use case: product-mockup. Create one exceptionally crisp photorealistic graphic design portfolio image, landscape 3:2, 1536x1024. Original fictional Russian architecture bureau identity called "КОНТУР". Clean contemporary editorial identity in graphite, ivory and vivid cobalt blue. Carefully arranged letterhead, two heavy business cards, a folded presentation folder and a small blueprint fragment; real paper texture, exact clean print, overhead flat lay on pale cool grey concrete. One original geometric monoline square/doorway logomark repeated consistently, rigorous alignment, beautiful large Cyrillic wordmark. Primary readable text exactly "КОНТУР". Secondary readable text exactly "АРХИТЕКТУРНОЕ БЮРО". Use only these short words; no fake addresses, names, phone numbers or illegible filler. Show meaningful variations of the identity across stationery, not a page full of identical logos. Architectural taste, reserved and precise, negative space balanced with objects, soft raking daylight. This is an original demonstration brand, not an actual client or real brand. No English, watermarks, UI screens, glowing effects, decorative neon, wood desk or unrelated props.

### tea-packaging

Use case: product-mockup. Create a premium believable packaging design portfolio photograph, landscape 3:2, 1536x1024. Original fictional Russian loose-leaf tea brand "ЛИСТ И ЯГОДА". Two upright rectangular tea cartons and one flat label design shown beside them, arranged naturally on a softly lit pale blue surface. Distinctive illustrated raspberry branches and tea leaves printed on the packaging, matte powder-blue base, vivid raspberry-red accent and dark navy Cyrillic lettering. A small scattering of dried tea and one fresh raspberry are the only props. Clear hierarchy and large beautifully typeset legible Russian branding. Exact primary text "ЛИСТ И ЯГОДА". Exact product text "ИВАН-ЧАЙ", then "С МАЛИНОЙ", small "50 г". Coherent package geometry, realistic carton edges, professional printing, subtle paper grain, no plastic sheen. The botanical illustration should be refined screen-printed graphic art, not a crude doodle. Main labels face camera and remain fully readable. Original demonstration design with an invented brand, not an actual client. No English, gibberish microtext, watermark, website UI or frame.

### wedding-invitation

Use case: product-mockup. Create one refined photorealistic wedding stationery design portfolio image, landscape 3:2, 1536x1024. Original invitation suite for an imaginary couple. A large ivory invitation, a soft dusty-blue envelope with wax seal, a translucent vellum wrap and a small matching date card, beautifully arranged on pale warm linen. Muted blue hand-painted hydrangea flowers printed ONLY at the paper margins, generous clean whitespace, elegant exceptionally legible Russian serif typography, modern warm editorial style rather than ornate cursive. Exact main text on the large invitation: "ВЕРА И МАКСИМ", second line "ПРИГЛАШАЕМ НА СВАДЬБУ", date "17.07.2027". Small card text exactly "СОХРАНИТЕ ДАТУ". No venue, contact details or additional fine print. All letterforms correct Cyrillic, no English. Soft natural sunlight with subtle gentle shadows, material reality, purposeful print layout. The invitation and the names must be fully visible and readable, no cropped edges. Not a real client event: original demonstration design. No wedding rings, hands, people, logos, watermarks, UI or surrounding frame.

### jazz-poster

Use case: ads-marketing. Produce an original high-craft Russian jazz concert poster design shown as a convincing print mockup, landscape portfolio photograph 3:2, 1536x1024. One large vertical poster mounted on a warm grey gallery wall, and a smaller matching flyer lying on a narrow concrete ledge. Deep oxblood red, rich black and warm ivory, bold condensed Cyrillic typography as the main visual, photographic close-up of a brass saxophone with genuine dark club atmosphere integrated into the lower half of the poster. No people. Sophisticated editorial cultural design with clear hierarchy, strong contrast, precise typography, uncoated printed paper. Exact large headline "НОЧНОЙ ДЖАЗ". Exact smaller line "ЖИВОЙ ЗВУК". Bottom line exactly "СУББОТА · 20:00". These are the only words. Original fictional event demonstration, no actual venue, performer, business contact or unsupported claim. No English letters, illegible filler, watermarks, mockup labels, date invented beyond the given words, website UI or outer border. Show the entire poster with generous readable size; natural camera perspective, gentle directional light.

### backpack-marketplace

Use case: product-mockup. Create a polished original Russian marketplace product-card design portfolio image, landscape 3:2, 1536x1024. Show exactly THREE distinct portrait product listing slides arranged side by side in one clean image, equal heights with small gutters, completely readable and fully inside frame. Same fictional unbranded mustard-yellow urban backpack with black zippers consistently photographed in all three slides, professional retail product photography, accurate continuous backpack construction. Palette pale cool grey, charcoal type, mustard accents. Slide1 hero bag front three-quarter view with very large Russian heading "ГОРОД В ДВИЖЕНИИ" and smaller "РЮКЗАК НА КАЖДЫЙ ДЕНЬ". Slide2 close-up of the open laptop compartment with heading "ВСЁ НА СВОЁМ МЕСТЕ", smaller "ОТДЕЛЕНИЕ ДЛЯ НОУТБУКА". Slide3 rear straps and padded back view with heading "УДОБНО В ДОРОГЕ". Strong actual marketplace graphic design, generous hierarchy, intentional alignment, clean white space, simple restrained feature callout lines only where useful. No UI browser, shopping app chrome, prices, discounts, star ratings, invented numeric specifications, real brand logos, English, gibberish text, watermarks or human figures. This is a fictional demonstration product/design, not an actual client commission.

