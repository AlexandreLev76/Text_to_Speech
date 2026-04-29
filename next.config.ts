import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: '/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
    },
  ],
};

export default withNextIntl(nextConfig);
