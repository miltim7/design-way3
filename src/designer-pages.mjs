import { site } from './config.mjs';

export function designerPage({esc,arrow}) {
  const person=site.coordinator;
  const paragraphs=person.biography?.length?person.biography:[
    'Я — Николай Парфенков, графический дизайнер. Помогаю оформить то, что вы задумали: новый бизнес, товар, событие или музыкальный релиз.',
    'В основном работаю над дизайном сам. Со мной вы обсуждаете задачу, смотрите макеты и согласуете правки — от первой идеи до передачи файлов.',
    'Можно прийти с готовыми материалами, наброском или просто рассказом о том, что хочется сделать. Сначала разберёмся, где будет использоваться дизайн и что он должен донести.'
  ];
  const icon=(paths)=>`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const conversation=icon('<path d="M20 11a7 7 0 0 1-7 7H8l-4 3v-6a7 7 0 0 1-1-4V9a7 7 0 0 1 7-7h3a7 7 0 0 1 7 7Z"/><path d="M8 8h7M8 12h5"/>');
  const pencil=icon('<path d="m14 4 6 6M4 20l4-1L21 6a2.8 2.8 0 0 0-4-4L4 15l-1 6Z"/><path d="m4 15 4 4"/>');
  const files=icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>');
  return `<main id="main" class="designer-page">
    <section class="designer-intro"><div class="wrap">
      <a class="text-link back-link" href="/">${arrow} На главную</a>
      <div class="designer-intro-layout"><div class="designer-intro-copy"><h1>${esc(person.fullName)}</h1><p class="designer-profession">${esc(person.role)}</p><p class="designer-intro-text">${esc(paragraphs[0])}</p><a class="button button-dark" href="/#contact">Давайте обсудим вашу идею ${arrow}</a><a class="text-link designer-work-link" href="/portfolio/">Посмотреть работы ${arrow}</a></div>
      <figure class="designer-cover${person.photo?' has-portrait':''}">${person.photo?`<img src="${esc(person.photo)}" alt="${esc(person.fullName)}" srcset="${esc(person.photoSrcset||'')}" sizes="(max-width:600px) calc(100vw - 40px), (max-width:800px) 45vw, 560px" width="853" height="1280" fetchpriority="high">`:'<picture><source srcset="/assets/hero-studio-768.webp 768w, /assets/hero-studio-1280.webp 1280w" sizes="(max-width:800px) calc(100vw - 40px), 560px" type="image/webp"><img src="/assets/hero-studio-1280.webp" alt="Иллюстрация графического дизайна: упаковка, книга и печатные материалы в тёплых оттенках" width="1672" height="941" fetchpriority="high"></picture>'}${!person.photo?'<figcaption><span>Упаковка. Полиграфия. Визуальный стиль.</span><span class="designer-cover-detail" aria-hidden="true">С вниманием к деталям</span></figcaption>':''}</figure></div>
      <div class="designer-responsibilities" aria-label="Что я беру на себя"><div>${conversation}<p>Обсуждаем<br> напрямую</p></div><div>${pencil}<p>В основном<br> создаю дизайн сам</p></div><div>${files}<p>Готовлю файлы<br> под вашу задачу</p></div></div>
    </div></section>
    <section class="designer-conversation section"><div class="wrap designer-split"><h2>Можно просто<br> рассказать об идее.</h2><div class="designer-biography">${paragraphs.slice(1).map(p=>`<p>${esc(p)}</p>`).join('')}</div></div></section>
    <section class="designer-practice section" aria-labelledby="practice-title"><div class="wrap designer-split">
      <h2 id="practice-title">Для чего<br> нужен дизайн?</h2><div class="designer-practice-list">
        <div><img src="/assets/designer/festival-05-640.webp" alt="Кружка с логотипом фестиваля «Глуши Звук»" width="1536" height="1024" loading="lazy"><div><h3>Чтобы вас узнавали</h3><p>Логотип, упаковка и этикетка помогают собрать образ бизнеса. Важно, чтобы отдельные материалы работали вместе.</p><a class="text-link" href="/#services">Логотипы и упаковка ${arrow}</a></div></div>
        <div><img src="/assets/designer/education-ai-02-640.webp" alt="Разворот журнала об искусственном интеллекте в образовании" width="1536" height="1024" loading="lazy"><div><h3>Чтобы вас понимали</h3><p>В журнале — текст и иллюстрации, на сайте — предложение и услуги, в карточке товара — его особенности. Оформление помогает найти главное.</p><a class="text-link" href="/#services">Печатные материалы и реклама ${arrow}</a></div></div>
        <div><img src="/assets/designer/music-cover-640.webp" alt="Обложка музыкального релиза в фиолетовой гамме" width="1536" height="1024" loading="lazy"><div><h3>Чтобы вашу идею заметили</h3><p>Обложка музыкального релиза, анимация или ролик могут передать настроение и рассказать историю через изображение и движение.</p><a class="text-link" href="/portfolio/">Посмотреть примеры ${arrow}</a></div></div>
      </div>
    </div></section>
    <section class="designer-approach section" aria-labelledby="approach-title"><div class="wrap designer-split">
      <h2 id="approach-title">Как будем<br> работать вместе</h2><div class="designer-approach-copy"><p class="designer-lead">Вам не нужно знать дизайнерские термины, чтобы объяснить свою идею.</p><p>Расскажите, для кого делаем дизайн, где он появится и к какой дате нужен. Покажите то, что нравится, — и то, чего точно не хочется.</p><p>До начала работы согласуем состав материалов, стоимость, сроки и правки. Затем обсудим макет и подготовим нужные файлы для печати или публикации.</p><div class="designer-reading"><a href="/offer-agreement/">Условия заказа ${arrow}</a><a href="/delivery/">Как получить файлы ${arrow}</a></div></div>
    </div></section>
    <section class="designer-close section"><div class="wrap"><h2>Что вы задумали?</h2><p>Расскажите об идее своими словами. С этого и начнём.</p><a class="button button-dark" href="/#contact">Рассказать о задаче ${arrow}</a><a class="text-link" href="/portfolio/">Сначала посмотреть работы ${arrow}</a></div></section>
  </main>`;
}
