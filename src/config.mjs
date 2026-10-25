// All unconfirmed identity and launch details live here. No old business data is assumed.
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
  // Reference documents copied at the user's explicit request; paths are project-relative.
  documents: { privacy: 'legal/privacy-policy.html', offer: 'legal/offer-agreement.html', payment: 'legal/payment.html', delivery: 'legal/delivery.html' },
  documentTitles: { privacy: 'Политика конфиденциальности', offer: 'Договор публичной оферты', payment: 'Способы оплаты', delivery: 'Информация о доставке и оплате' },
  // Non-conflicting terms verified in live Sibax delivery; preserved as requested.
  // Conflicting delivery times / advance thresholds are deliberately not invented here.
  terms: { confirmed: true, revisions: 3, revisionDays: 14, expressSurcharge: 50, archiveMonths: 12 }
};
