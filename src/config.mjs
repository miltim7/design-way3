// Project identity, contact details and service settings.
export const site = {
  brand: 'слой',
  coordinator: {
    name: 'Николай', fullName: 'Николай Парфенков', role: 'Графический дизайнер',
    photo: '/assets/designer/nikolay-853.webp',
    photoSrcset:'/assets/designer/nikolay-320.webp 320w, /assets/designer/nikolay-640.webp 640w, /assets/designer/nikolay-853.webp 853w',
    biography: [
      'Здравствуйте, я Николай, графический дизайнер. Делаю дизайн, который работает.',
      'Для меня клиент — не заказ, а человек со своей историей. Пока мы работаем над проектом, мы как друзья и единомышленники: я слушаю, задаю вопросы, и мы вместе находим сильное решение.',
      'Каждый проект — маленькое путешествие: от идеи и концепции до цельного образа, который вдохновляет и привлекает покупателей.'
    ],
    summary: 'Делаю дизайн, который работает. Для меня клиент — человек со своей историей. Слушаю, задаю вопросы и вместе с вами нахожу сильное решение. Разрабатываю упаковку и фирменный стиль, готовлю макеты к печати и сам общаюсь с подрядчиками.',
    specialties: [
      {title:'Упаковка и продуктовые линейки',text:'Разрабатываю дизайн для отдельного продукта и целых продуктовых линеек.',image:'onar-packaging',alt:'Жёлтая упаковка яиц «Онар»',link:'Упаковка и этикетки'},
      {title:'Фирменный стиль',text:'Делаю фирменный стиль для рекламы, сайтов и маркетплейсов.',image:'festival-03',alt:'Футболки с графикой фестиваля «Глуши Звук»',link:'Фирменный стиль и графика'},
      {title:'Макеты к печати',text:'Готовлю макеты к печати и сам общаюсь с подрядчиками.',image:'education-ai-02',alt:'Разворот журнала об искусственном интеллекте в образовании',link:'Печатные материалы'}
    ],
    result: 'Упаковка, которую берут с полки, сайт, на котором остаются, и бренд, который запоминают.',
    approach: 'С любым проектом просто: говорю без сложных терминов, не навязываю лишнее, делаю в срок.',
    tools: ['Figma','Sketch','Adobe Creative Cloud','Blender 4.0'],
    invitation: 'Расскажите о своей задаче, и отправимся в путешествие вместе.'
  },
  brandConfirmed: false,
  description: 'Графический дизайн для бизнеса',
  domain: null,
  email: null,
  phone: null,
  phoneDisplay: null,
  telegram: null,
  legal: { ready: false, entity: null, inn: null, ogrnip: null, address: null },
  // Project information pages; paths are relative to the project root.
  documents: { privacy: 'legal/privacy-policy.html', offer: 'legal/offer-agreement.html', payment: 'legal/payment.html', delivery: 'legal/delivery.html' },
  documentTitles: { privacy: 'Политика конфиденциальности', offer: 'Договор публичной оферты', payment: 'Способы оплаты', delivery: 'Информация о доставке и оплате' },
  // Service terms maintained in this project configuration.
  terms: { confirmed: true, revisions: 3, revisionDays: 14, expressSurcharge: 50, archiveMonths: 12 }
};
