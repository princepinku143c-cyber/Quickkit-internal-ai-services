import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoMetaProps {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  schemaObj?: object;
  articleBody?: string;
  datePublished?: string;
  authorName?: string;
}

export const SeoMeta: React.FC<SeoMetaProps> = ({
  title, description, keywords, ogImage, ogType = 'website',
  canonical, schemaObj, articleBody, datePublished, authorName = 'QuickKit AI'
}) => {
  const siteName = 'QuickKit AI';
  const defaultOgImage = ogImage || 'https://quickkitai.com/og-image.png';
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://quickkitai.com');
  const fullTitle = title.includes('QuickKit') ? title : `${title} | QuickKit AI`;

  const articleSchema = articleBody ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    articleBody,
    author: { '@type': 'Organization', name: authorName },
    datePublished: datePublished || new Date().toISOString(),
    publisher: { '@type': 'Organization', name: siteName }
  } : null;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: 'https://quickkitai.com',
    description: 'Managed AI agents and AI workforce systems for Indian businesses, including sales, support, CRM, WhatsApp, voice and business automation.'
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={defaultOgImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={defaultOgImage} />

      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      {schemaObj && (
        <script type="application/ld+json">
          {JSON.stringify(schemaObj)}
        </script>
      )}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
};
