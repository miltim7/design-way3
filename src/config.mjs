// Project identity, contact details and service settings.
export const site = {
  brand: 'слой',
  coordinator: { name: 'Николай', fullName: 'Николай Парфенков', role: 'Графический дизайнер', photo: null },
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
