import { services, groups, projects, faqs } from './content.mjs';
import { site } from './config.mjs';

// The homepage follows the work first, then the catalogue and the conversation.
export function homepageSections({ esc, money, arrow, plus, picture, serviceArt, galleryOnly=false }) {
  const preview=(p,id,cls)=>`<video id="${id}" class="${cls} video-preview ${p.service==='music-video'?'preview-music':'preview-business'}" data-video-preview data-src="${esc(p.video)}" data-title="${esc(p.title)}" poster="/assets/${p.image}-640.webp" muted loop playsinline preload="none" aria-hidden="true" width="1536" height="1024"></video>`;
  const previewToggle=(p,id)=>`<button type="button" class="preview-toggle" data-preview-toggle="${id}" data-playing="false" aria-controls="${id}" aria-label="Воспроизвести превью: ${esc(p.title)}"><svg class="preview-pause" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg><svg class="preview-play" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg></button>`;
  const hasClientWork=projects.some(p=>p.kind==='client');
  const work = `<section class="work-section work-gallery section${galleryOnly?' portfolio-gallery':''}" id="work" aria-labelledby="work-title">
    <div class="wrap">
      <div class="gallery-heading section-heading">${galleryOnly?'<h1 id="work-title">Портфолио<br> в деталях.</h1>':'<h2 id="work-title">У каждой идеи —<br> свой характер.</h2>'}<div><p>${galleryOnly?'Что нужно было оформить, почему выбрано такое решение и как оно выглядит на разных носителях. От упаковки до анимационного ролика.':'От упаковки и карточек товаров до ролика с персонажем. У каждого примера есть своя задача — посмотрите, как она решена.'}</p><p class="gallery-note">${hasClientWork?'Заказные проекты отмечены отдельно. Остальные примеры показывают возможные направления оформления.':'Здесь представлены демонстрационные работы — примеры оформления для разных задач.'}</p></div></div>
      <div class="filters gallery-filters" role="group" aria-label="Фильтр примеров"><button data-filter="all" aria-pressed="true">Все примеры</button><button data-filter="identity" aria-pressed="false">Логотипы и стиль</button><button data-filter="print" aria-pressed="false">Для печати</button><button data-filter="digital" aria-pressed="false">Реклама и обложки</button><button data-filter="marketplace" aria-pressed="false">Маркетплейсы</button><button data-filter="motion" aria-pressed="false">Анимация и видео</button></div>
      <div class="project-grid">${projects.map((p,i)=>`<article class="project project-${i}${p.fit==='contain'?' project-contain':''}" data-category="${p.category}">${p.video?'<div class="project-preview-wrap">':''}<button class="project-image" data-project="${p.id}" aria-label="Рассмотреть «${esc(p.title)}»">${p.video?preview(p,'preview-gallery-'+p.id,'project-preview'):picture(p,true)}${p.video?'<span class="project-media-label"><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3 17 10 6 17Z" fill="currentColor"/></svg>Ролик · 0:12</span>':p.before?'<span class="project-media-label">До / после</span>':'<span class="project-open">'+plus+'</span>'}</button>${p.video?previewToggle(p,'preview-gallery-'+p.id)+'</div>':''}<div class="project-caption"><h3>${esc(p.title)}</h3><p>${esc(p.label)}${p.kind==='client'?' · Заказной проект':''}</p>${galleryOnly?`<dl class="portfolio-story"><dt>Задача</dt><dd>${esc(p.story?.task)}</dd><dt>Решение</dt><dd>${esc(p.description)}</dd><dt>Материалы</dt><dd>${esc(p.story?.items?.join(' · '))}</dd></dl><button class="text-link portfolio-open" data-project="${p.id}">Рассмотреть подробнее <span class="sr-only">— ${esc(p.title)}</span>${arrow}</button>`:`<p class="project-purpose">${esc(p.story?.task)}</p>`}</div></article>`).join('')}</div>
      <p id="filter-status" class="sr-only" role="status"></p>
      <div class="gallery-end"><p>${galleryOnly?'Теперь — о вашей задаче.':'За каждым макетом — своё решение.'}</p>${galleryOnly?`<button class="text-link" data-order="other">Обсудим вашу идею ${arrow}</button>`:`<a class="text-link" href="/portfolio/">Разобрать примеры подробнее ${arrow}</a>`}</div>
    </div>
  </section>`;
  if(galleryOnly)return work;

  const catalogue = `<section class="services-section catalog-section section" id="services" aria-labelledby="services-title"><div class="wrap catalog-layout">
    <div class="catalog-aside"><h2 id="services-title">Что нужно<br> оформить?</h2><p>Одна задача или несколько связанных материалов — начнём с того, что нужно вам.</p>
      <div class="filters catalog-filters" role="group" aria-label="Фильтр услуг"><button data-service-filter="all" aria-pressed="true">Все услуги <span>${services.length}</span></button>${groups.map(g=>`<button data-service-filter="${g.id}" aria-pressed="false">${esc(g.name)} <span>${services.filter(s=>s.group===g.id).length}</span></button>`).join('')}</div>
      <p class="catalog-price-note">Цены «от» — начальные ориентиры. Для видео и карточек товаров стоимость рассчитаю по вашей задаче.</p>
    </div>
    <div class="catalog-content"><div class="service-grid" id="service-grid">${services.map(s=>{
      const art=serviceArt.find(a=>a.id===s.id),film=projects.find(p=>p.video&&p.service===s.id);
      return `<article class="service-card" data-service-group="${s.group}">${film?'<div class="service-preview-wrap"><button type="button" class="service-preview-open" data-project="'+film.id+'" aria-label="Смотреть пример: '+esc(film.title)+'">'+preview(film,'preview-service-'+s.id,'service-art')+'</button>'+previewToggle(film,'preview-service-'+s.id)+'</div>':'<img class="service-art" src="/assets/services/'+(art.image || s.id)+'-640.webp" width="960" height="640" alt="'+esc(art.alt)+'" loading="lazy" decoding="async">'}<div class="service-card-content"><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p><p class="service-result">${esc(s.result)}</p><div class="service-card-bottom"><span>${s.price===null?'<strong class="service-quote">Стоимость по задаче</strong>':'от <strong>'+money(s.price)+' ₽</strong>'}</span><button class="order-link" data-order="${s.id}">Обсудить<span class="sr-only">: ${esc(s.name)}</span>${arrow}</button></div></div></article>`;
    }).join('')}</div>
    <button class="button button-outline service-more" data-service-more aria-controls="service-grid" aria-expanded="false" hidden>Показать все ${services.length} услуг</button><p id="service-filter-status" class="sr-only" role="status"></p>
    <p class="catalog-art-note">Изображения — примеры оформления для каждой услуги.</p>
    <div class="catalog-other"><h3>Не нашли свою задачу?</h3><p>Иллюстрации, мерч, посты или инфографика — расскажите, что задумали.</p><button class="text-link" data-order="other">Спросить о другой задаче ${arrow}</button></div></div>
  </div></section>`;

  const process = `<section class="collaboration-section section" id="process" aria-labelledby="process-title"><div class="wrap">
    <div class="collaboration-heading"><h2 id="process-title">За дизайном —<br> живой разговор.</h2><p>Не нужно разбираться в форматах и писать идеальное техническое задание. Начнём с вашей истории.</p></div>
    <div class="collaboration-layout"><div class="coordinator-copy">
      ${site.coordinator.photo?`<img class="coordinator-photo" src="${esc(site.coordinator.photo)}" alt="${esc(site.coordinator.name)} — графический дизайнер" width="160" height="160" loading="lazy">`:''}
      <h3>Я — ${esc(site.coordinator.fullName)}.</h3><p class="coordinator-role">${esc(site.coordinator.role)}</p>
      <p>В основном занимаюсь дизайном сам: обсуждаю идею, разрабатываю макеты и готовлю файлы для печати или публикации. Со мной можно напрямую обсудить работу, уточнить детали и внести правки.</p><a class="text-link" href="/about/">Познакомиться со мной ${arrow}</a>
    </div><ol class="conversation-steps">
      <li><span class="conversation-number" aria-hidden="true">01</span><div><h3>Сначала — ваша идея</h3><p>Расскажите о бизнесе, событии или проекте. Можно своими словами, с наброском или ссылкой на то, что нравится.</p></div></li>
      <li><span class="conversation-number" aria-hidden="true">02</span><div><h3>Потом — понятный план</h3><p>Вместе определим, какие материалы нужны и что вы получите. До начала работы согласуем состав макетов, стоимость, сроки и порядок правок.</p></div></li>
      <li><span class="conversation-number" aria-hidden="true">03</span><div><h3>Вместе — до готовых файлов</h3><p>Подготовлю макет, вы поделитесь впечатлениями и пожеланиями. Внесу согласованные правки и передам файлы для печати или публикации.</p></div></li>
    </ol></div>
  </div></section>`;

  const notes = [
    ['Можно прийти без готового ТЗ', faqs[2][1]],
    ['Стоимость станет известна заранее', faqs[1][1]],
    ['Сроки и правки согласуем на старте', `${faqs[3][1]} ${faqs[6][1]}`],
    ['Файлы подготовим под вашу задачу', faqs[5][1]]
  ];
  const beforeOrder = `<section class="order-notes-section section" id="faq" aria-labelledby="notes-title"><div class="wrap">
    <div class="order-notes-heading"><h2 id="notes-title">До старта<br> договоримся о главном.</h2><p>Чтобы вы понимали, что получите, сколько это стоит и как будет проходить работа.</p></div>
    <div class="order-notes">${notes.map(([title,body])=>`<article class="order-note"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('')}</div>
    <div class="order-notes-end"><span>Условия — в одном месте</span><div><a href="/offer-agreement/">Условия заказа ${arrow}</a><a href="/delivery/">Передача файлов ${arrow}</a></div></div>
  </div></section>`;
  return work + catalogue + process + beforeOrder;
}
