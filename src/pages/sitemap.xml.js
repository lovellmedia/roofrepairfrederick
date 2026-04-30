import { site, corePages, serviceFamilies } from '../data/siteData.js';

const today = new Date().toISOString().slice(0, 10);
const baseUrl = `https://${site.domain}`;

function normalizePath(slug) {
  if (!slug) return '/';
  return `/${slug.replace(/^\/+|\/+$/g, '')}/`;
}

function urlEntry(pathname, priority, changefreq = 'monthly') {
  return [
    '  <url>',
    `    <loc>${baseUrl}${pathname}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].join('\n');
}

export async function GET() {
  const routes = [
    ...corePages.map((page) => normalizePath(page.slug)),
    '/services/',
    ...serviceFamilies.flatMap((family) => [
      `/services/${family.slug}/`,
      ...family.children.map((child) => `/services/${family.slug}/${child.slug}/`)
    ])
  ];
  const uniqueRoutes = [...new Set(routes)];
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...uniqueRoutes.map((route) => urlEntry(route, route === '/' ? '1.0' : route === '/services/' ? '0.9' : route.split('/').filter(Boolean).length === 2 ? '0.8' : '0.7')),
    '</urlset>'
  ].join('\n');
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
