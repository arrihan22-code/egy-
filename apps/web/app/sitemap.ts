import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://egypt-services-web.vercel.app';

  const staticRoutes = [
    '',
    '/login',
    '/signup',
    '/search',
    '/emergency',
    '/banks',
    '/pharmacies',
    '/hospitals',
    '/government',
    '/transport',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return staticRoutes;
}
