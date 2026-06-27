import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://inee.lu/en', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://inee.lu/fr', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://inee.lu/mentions-legales', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://inee.lu/legal-notice', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
