import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'nl', 'ja'],
  defaultLocale: 'fr',
});
