# Новые примеры и услуги — 25 октября 2026

Подтверждённый запрос: анимационные ролики для бизнеса, клипы на музыку, карточки маркетплейсов и замена фона. В каталоге теперь 16 услуг (12 прежних и 4 новых), в галерее — 13 примеров (9 прежних и 4 новых). Цены новых направлений не заданы клиентом: в каталоге и обеих формах отображается «Стоимость по задаче». Старые цены сохранены.

Галерея содержит демонстрационные материалы, не реальные заказы Николая. Нет вымышленных клиентов, отзывов или результатов продаж. Классификация: «Маркетплейсы» и «Анимация и видео».

## Медиа и воспроизведение

- business-story.mp4 — 12 секунд, H.264/AAC, 1280×720; оригинальная анимация с персонажем. Русская синтезированная озвучка Microsoft Pavel, текст и WebVTT. Иллюстрация персонажа создана ImageGen. Это анимация готового персонажа, без заявлений о покадровом 3D-производстве или синхронизации губ.
- music-film.mp4 — 12 секунд, H.264/AAC, 1280×720; оригинальная графическая анимация орбит, частиц и ритма. Инструментальная музыка синтезирована в scripts/render-portfolio-motion.py; чужая песня не используется. Это пример графического направления для музыкального видео.
- Полные видео в модалке запускаются пользователем: без автозапуска и фонового звука. Управление звуком и полный экран — стандартные элементы плеера. Пауза при закрытии, смене примера и скрытии вкладки. Превью в галерее и каталоге проигрываются автоматически без звука и циклически, когда видимы на четверть. Кнопка паузы останавливает отдельное превью; уход из видимой области, скрытие вкладки и модалка приостанавливают видео. Reduced motion оставляет постер и ручной запуск. Контроллер — public/video-previews.js; поведение проверяет tests/video-previews.test.mjs.
- Замена фона: исходник и результат одного предмета, сравнение доступным с клавиатуры диапазоном с процентами в aria-valuetext без дополнительных кнопок ракурсов и подписи под медиа. Клавиатура не переключает проект при работе с ползунком.

## Исходники

assets-original/services/marketplace-card.png, product-before.png, product-background.png, courier-character.png. Рендеры business-video.png и music-video.png — кадры оригинальных роликов. public/assets/services/* — адаптивные WebP 640/960/1280/1920. public/assets/video/ — видео, постеры и субтитры.

Локальная озвучка: PowerShell System.Speech.Synthesis.SpeechSynthesizer, голос Microsoft Pavel, Rate=0, текст «Ваш заказ уже в пути. Доставим бережно, чтобы вы занимались любимым делом.». WAV в artifacts/business-narration.wav. Для воспроизводимости на Windows нужен установленный русский голос. Скомпилированные MP4 сохранены в репозитории.

Повторная сборка из корня проекта на Windows (после `npm ci`):

```powershell
python -m pip install Pillow numpy imageio-ffmpeg
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/narrate-portfolio.ps1
python scripts/render-portfolio-motion.py
node scripts/expanded-assets.mjs
npm run build
```

`scripts/narrate-portfolio.ps1` создаёт озвучку до запуска рендера. `scripts/render-portfolio-motion.py` использует её для бизнес-ролика, синтезирует оригинальную музыку в artifacts/orbit-score.wav и создаёт MP4, постеры и PNG для каталога. Рендер использует шрифты Segoe UI из `C:/Windows/Fonts/`. `scripts/expanded-assets.mjs` затем обновляет четыре размера WebP из PNG. Для обычной сборки готового сайта повторный рендер медиа не требуется.

## Запросы ImageGen

### marketplace-lamp

Use case: ads-marketing. Asset type: realistic Russian marketplace product-card portfolio example. Wide 3:2 composition, full bleed, no browser mockup. Two carefully designed vertical product cards side by side on warm ivory backdrop, both featuring the SAME contemporary cordless mushroom-shaped terracotta table lamp. Left larger hero card exact Russian headline "СВЕТ ДЛЯ ВАШИХ ВЕЧЕРОВ", small descriptor "Настольная лампа", product on ivory pedestal with gentle warm glow; right detailed card headline "УЮТ В ОДНОМ КАСАНИИ", with exactly three neat labels "Мягкий свет", "Без проводов", "Сенсорное управление". Typographic clarity, restrained professional editorial art direction, muted terracotta and deep chocolate, beautiful realistic studio product photography with believable materials, refined uncluttered layout, product prominent, legible flawless Cyrillic, no random English, no actual marketplace logo, no invented certification badges or reviews, no watermark. The two cards should fill most of the image, with modest cream gutters.

### product-before

Use case: product-mockup. Asset type: before photo for a product background replacement portfolio. Horizontal 3:2 photograph. A single sage green ceramic mug with rounded handle and off-white interior centered on a worn light grey kitchen countertop, plain off-white slightly cluttered kitchen in background, a blurred cloth and dish brush far behind, mundane overcast window lighting. Mug takes 55 percent of image height and stands at exact center with handle on right, front three-quarter camera view at mug level. Real natural ceramic texture, physically plausible, no writing, no text, no brands, no watermarks. This is a believable simple product photo to be professionally improved later.

### courier-character

Use case: stylized-concept. Asset type: transparent character illustration for a polished animated business explainer. A charming original friendly orange terracotta bird courier riding a small sage green cargo bicycle with one cream parcel in the front basket. Full side profile facing right, whole bicycle and both wheels fully visible, bird face in three-quarter with warm bright eyes, wearing cream cap, rounded tactile clay 3D illustration with exquisite soft material and subtle shadows on character only. Isolated on genuinely transparent background. No ground plane, no text, no logos, no watermarks. Keep all elements inside image with 8 percent transparent margins. Bird and bike form one clean isolated subject to animate smoothly across an original scene. Wide landscape 3:2.

### product-background — редактирование

Исходник: assets-original/services/product-before.png. Изменение только окружения; форма, цвет, ракурс и расположение кружки сохранены.

Use case: precise-object-edit. Edit target: the attached photograph of a sage green ceramic mug. Replace ONLY the kitchen background and counter with a premium warm ivory seamless studio surface, a low cream circular display plinth under the mug, gentle natural sunlight from upper left and a soft botanical shadow on the far background. Keep the EXACT SAME mug, handle shape, glaze texture, color, camera angle, relative size, position, geometry and all its small imperfections completely unchanged. Mug remains centered with handle right and same pixel location. Professional clean marketplace-ready product photo, soft believable contact shadow, elegant cream and sage palette. Horizontal 3:2 same crop. No text, no logos, no extra objects, no watermark. Preserve product identity precisely; this demonstrates only a background replacement.

