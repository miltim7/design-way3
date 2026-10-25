import { services, groups, projects, faqs } from './content.mjs';
import { site } from './config.mjs';

// The homepage follows the work first, then the catalogue and the conversation.
export function homepageSections({ esc, money, arrow, plus, picture, serviceArt }) {
  const work = `<section class="work-section work-gallery section" id="work" aria-labelledby="work-title">
    <div class="wrap">
      <div class="gallery-heading section-heading"><h2 id="work-title">У каждой идеи —<br> свой характер.</h2><div><p>Логотип, упаковка, обложка или целая история бренда. Посмотрите, каким может быть ваш дизайн.</p><p class="gallery-note">Демонстрационные примеры: можно рассмотреть детали и выбрать ориентир для своей задачи.</p></div></div>
      <div class="filters gallery-filters" role="group" aria-label="Фильтр примеров"><button data-filter="all" aria-pressed="true">Все примеры</button><button data-filter="identity" aria-pressed="false">Логотипы и стиль</button><button data-filter="print" aria-pressed="false">Для печати</button><button data-filter="digital" aria-pressed="false">Реклама и обложки</button></div>
      <div class="project-grid">${projects.map((p,i)=>`<article class="project project-${i}" data-category="${p.category}"><button class="project-image" data-project="${p.id}" aria-label="Рассмотреть «${esc(p.title)}»">${picture(p,true)}<span class="project-open">${plus}</span></button><div class="project-caption"><h3>${esc(p.title)}</h3><p>${esc(p.label)}</p></div></article>`).join('')}</div>
      <p id="filter-status" class="sr-only" role="status"></p>
      <div class="gallery-end"><p>Есть пример, который вам близок?</p><button class="text-link" data-order="other">Обсудим вашу идею ${arrow}</button></div>
    </div>
  </section>`;

  const catalogue = `<section class="services-section catalog-section section" id="services" aria-labelledby="services-title"><div class="wrap catalog-layout">
    <div class="catalog-aside"><h2 id="services-title">Что нужно<br> оформить?</h2><p>Одна задача или несколько связанных материалов — начнём с того, что нужно вам.</p>
      <div class="filters catalog-filters" role="group" aria-label="Фильтр услуг"><button data-service-filter="all" aria-pressed="true">Все услуги <span>${services.length}</span></button>${groups.map(g=>`<button data-service-filter="${g.id}" aria-pressed="false">${esc(g.name)} <span>${services.filter(s=>s.group===g.id).length}</span></button>`).join('')}</div>
      <p class="catalog-price-note">Здесь — начальные цены. Точную стоимость согласуем после обсуждения задачи.</p>
    </div>
    <div class="catalog-content"><div class="service-grid" id="service-grid">${services.map(s=>{
      const art=serviceArt.find(a=>a.id===s.id);
      return `<article class="service-card" data-service-group="${s.group}"><img class="service-art" src="/assets/services/${art.image || s.id}-640.webp" width="960" height="640" alt="${esc(art.alt)}" loading="lazy" decoding="async"><div class="service-card-content"><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p><p class="service-result">${esc(s.result)}</p><div class="service-card-bottom"><span>от <strong>${money(s.price)} ₽</strong></span><button class="order-link" data-order="${s.id}">Обсудить<span class="sr-only">: ${esc(s.name)}</span>${arrow}</button></div></div></article>`;
    }).join('')}</div>
    <button class="button button-outline service-more" data-service-more aria-controls="service-grid" aria-expanded="false" hidden>Показать все ${services.length} услуг</button><p id="service-filter-status" class="sr-only" role="status"></p>
    <p class="catalog-art-note">Изображения — примеры оформления для каждой услуги.</p>
    <div class="catalog-other"><h3>Не нашли свою задачу?</h3><p>Иллюстрации, мерч, посты или инфографика — расскажите, что задумали.</p><button class="text-link" data-order="other">Спросить о другой задаче ${arrow}</button></div></div>
  </div></section>`;

  const process = `<section class="collaboration-section section" id="process" aria-labelledby="process-title"><div class="wrap">
    <div class="collaboration-heading"><h2 id="process-title">За дизайном —<br> живой разговор.</h2><p>Не нужно разбираться в форматах и писать идеальное техническое задание. Начнём с вашей истории.</p></div>
    <div class="collaboration-layout"><div class="coordinator-copy">
      ${site.coordinator.photo?`<img class="coordinator-photo" src="${esc(site.coordinator.photo)}" alt="${esc(site.coordinator.name)} — координатор проекта" width="160" height="160" loading="lazy">`:''}
      <h3>Я — ${esc(site.coordinator.name)}.<br> Буду с вами на связи.</h3><p class="coordinator-role">${esc(site.coordinator.role)}</p>
      <p>Помогу превратить пожелания в понятную задачу, соберу материалы и организую работу с дизайнером. Со мной можно обсудить макет, уточнить детали и передать правки.</p><button class="text-link" data-order="other">Рассказать Николаю о задаче ${arrow}</button>
    </div><ol class="conversation-steps">
      <li><span class="conversation-number" aria-hidden="true">01</span><div><h3>Сначала — ваша идея</h3><p>Расскажите о бизнесе, событии или проекте. Можно своими словами, с наброском или ссылкой на то, что нравится.</p></div></li>
      <li><span class="conversation-number" aria-hidden="true">02</span><div><h3>Потом — понятный план</h3><p>Соберём материалы и определим результат. До начала работы согласуем состав макетов, стоимость, сроки и порядок правок.</p></div></li>
      <li><span class="conversation-number" aria-hidden="true">03</span><div><h3>Вместе — до готовых файлов</h3><p>Дизайнер подготовит макет, вы дадите обратную связь. После согласования передадим файлы для печати или публикации.</p></div></li>
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
