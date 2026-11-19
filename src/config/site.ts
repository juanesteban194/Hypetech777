/**
 * Business data (docs/PROMPT_MAESTRO.md §1).
 *
 * Never invent values here. Every entry marked TODO(owner) is a placeholder that the owner
 * must confirm before phase 3; bracketed strings such as '[CIUDAD]' mean "not provided yet".
 */
export const siteConfig = {
  name: '[NOMBRE_TIENDA]', // TODO(owner): store name
  tagline: '[ESLOGAN]', // TODO(owner): tagline
  description: 'Ropa de segunda y nueva, tecnología y encargos.',
  locale: 'es-CO',
  currency: 'COP',
  timezone: 'America/Bogota',

  contact: {
    whatsapp: '[+57XXXXXXXXXX]', // TODO(owner): sales WhatsApp, E.164 format
    email: '[CORREO]', // TODO(owner): contact e-mail
    city: '[CIUDAD]', // TODO(owner): base city
  },

  social: {
    instagram: '[INSTAGRAM]', // TODO(owner)
    tiktok: '[TIKTOK]', // TODO(owner)
  },

  domain: '[DOMINIO]', // TODO(owner): production domain

  payments: {
    gateway: 'wompi',
    manualMethods: ['Nequi', 'Transferencia Bancolombia', 'Daviplata', 'Efectivo'], // TODO(owner): confirm
  },

  shipping: {
    metroDeliveryCop: null as number | null, // TODO(owner): home delivery, metropolitan area
    nationalCop: null as number | null, // TODO(owner): national shipping
    pickupCop: 0, // pick-up at the store point is free (§1)
  },

  policies: {
    reservationMinutesOnline: 30, // §1: online payment hold
    reservationHoursWhatsApp: 24, // §1: WhatsApp order hold
    quoteValidityDays: 3, // TODO(owner): confirm (§1 lists [3])
    soldVisibleDays: 7, // TODO(owner): confirm (§1 lists [7])
    lowPriceThresholdCop: 100_000, // TODO(owner): confirm (§1 lists [$100.000])
    depositPercentRange: [30, 50] as const, // TODO(owner): confirm (§1 lists [30-50 %])
  },
} as const

export type SiteConfig = typeof siteConfig
