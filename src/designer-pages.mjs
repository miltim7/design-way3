import { site } from './config.mjs';

export function designerPage({esc,arrow}) {
  const person=site.coordinator;
  const paragraphs=person.biography?.length?person.biography:[
    'Я — Николай Парфенков, графический дизайнер. Помогаю оформить то, что вы задумали: новый бизнес, товар, событие или музыкальный релиз.',
    'В основном работаю над дизайном сам. Со мной вы обсуждаете задачу, смотрите макеты и согласуете правки — от первой идеи до передачи файлов.',
    'Можно прийти с готовыми материалами, наброском или просто рассказом о том, что хочется сделать. Сначала разберёмся, где будет использоваться дизайн и что он должен донести.'
  ];
  return `<main id="main" class="designer-page">
    <section class="designer-intro"><div class="wrap">
      <a class="text-link back-link" href="/">${arrow} На главную</a>
      <div class="designer-intro-layout"><div><h1>${esc(person.fullName)}</h1><p class="designer-profession">${esc(person.role)}</p></div>
      <div class="designer-biography">${person.photo?`<img class="designer-portrait" src="${esc(person.photo)}" alt="${esc(person.fullName)}" width="480" height="600">`:''}${paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<a class="text-link" href="/#contact">Обсудить со мной задачу ${arrow}</a></div></div>
    </div></section>
    <section class="designer-practice section" aria-labelledby="practice-title"><div class="wrap designer-split">
      <h2 id="practice-title">Для чего<br> нужен дизайн?</h2><div class="designer-practice-list">
        <div><h3>Чтобы вас узнавали</h3><p>Логотип, упаковка и этикетка помогают собрать образ бизнеса. Важно, чтобы отдельные материалы работали вместе.</p><a class="text-link" href="/#services">Логотипы и упаковка ${arrow}</a></div>
        <div><h3>Чтобы вас понимали</h3><p>На афише — событие и дата, в меню — блюда и цены, в карточке товара — сам товар и его особенности. Оформление помогает найти главное.</p><a class="text-link" href="/#services">Печатные материалы и реклама ${arrow}</a></div>
        <div><h3>Чтобы вашу идею заметили</h3><p>Обложка музыкального релиза, анимация или ролик могут передать настроение и рассказать историю через изображение и движение.</p><a class="text-link" href="/portfolio/">Посмотреть примеры ${arrow}</a></div>
      </div>
    </div></section>
    <section class="designer-approach section" aria-labelledby="approach-title"><div class="wrap designer-split">
      <h2 id="approach-title">Как будем<br> работать вместе</h2><div class="designer-approach-copy"><p class="designer-lead">Вам не нужно знать дизайнерские термины, чтобы объяснить свою идею.</p><p>Расскажите, для кого делаем дизайн, где он появится и к какой дате нужен. Покажите то, что нравится, — и то, чего точно не хочется.</p><p>До начала работы согласуем состав материалов, стоимость, сроки и правки. Затем обсудим макет и подготовим нужные файлы для печати или публикации.</p><div class="designer-reading"><a href="/offer-agreement/">Условия заказа ${arrow}</a><a href="/delivery/">Как получить файлы ${arrow}</a></div></div>
    </div></section>
    <section class="designer-close section"><div class="wrap"><h2>Что вы задумали?</h2><p>Расскажите об идее своими словами. С этого и начнём.</p><a class="button button-dark" href="/#contact">Рассказать о задаче ${arrow}</a><a class="text-link" href="/portfolio/">Сначала посмотреть примеры ${arrow}</a></div></section>
  </main>`;
}
