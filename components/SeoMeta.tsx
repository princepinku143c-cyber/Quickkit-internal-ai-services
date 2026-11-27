import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

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
  dateModified?: string;
  authorName?: string;
  authorUrl?: string;
  breadcrumbs?: BreadcrumbItem[];
  includeArticle?: boolean;
}

const DEFAULT_DATE_PUBLISHED = '2026-11-18T12:00:00+05:30';
const DEFAULT_DATE_MODIFIED = '2026-11-27T18:00:00+05:30';

export const PUBLIC_SITEMAP_LINKS: { label: string; to: string }[] = [
  { label: 'Home', to: '/' },
  { label: 'AI Visibility & AEO', to: '/ai-visibility' },
  { label: 'Proof of Value', to: '/proof-of-value' },
  { label: 'Live Demo', to: '/live-demo' },
  { label: 'Real Estate AI', to: '/services/real-estate' },
  { label: 'Healthcare AI', to: '/services/healthcare' },
  { label: 'Lead Qualification Guide', to: '/guides/real-estate-ai-lead-qualification' },
  { label: 'Real Estate AI FAQs', to: '/real-estate-ai-questions' },
  { label: 'Knowledge Hub', to: '/blog' },
  { label: 'SEO Audit', to: '/seo-audit' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

export const AUTHORITATIVE_DOCS_LINKS: { label: string; href: string }[] = [
  {
    label: 'Google Rich Results & Structured Data Docs',
    href: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data',
  },
  {
    label: 'Schema.org Vocabulary',
    href: 'https://schema.org/',
  },
  {
    label: 'llms.txt Specification (llmstxt.org)',
    href: 'https://llmstxt.org/',
  },
];

function buildDefaultBreadcrumbs(canonicalUrl: string, pageTitle: string): BreadcrumbItem[] {
  let pathname = '/';
  try {
    pathname = new URL(canonicalUrl).pathname || '/';
  } catch {
    pathname = '/';
  }
  const items: BreadcrumbItem[] = [{ name: 'Home', url: 'https://quickkitai.com/' }];
  if (pathname === '/') return items;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 1) {
    const section = segments[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const sectionUrl =
      segments[0] === 'services'
        ? 'https://quickkitai.com/services/real-estate'
        : segments[0] === 'guides'
          ? 'https://quickkitai.com/blog'
          : `https://quickkitai.com/${segments[0]}`;
    items.push({ name: section, url: sectionUrl });
  }
  items.push({ name: pageTitle.split('|')[0].trim(), url: canonicalUrl });
  return items;
}

export const SeoMeta: React.FC<SeoMetaProps> = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonical,
  schemaObj,
  articleBody,
  datePublished = DEFAULT_DATE_PUBLISHED,
  dateModified = DEFAULT_DATE_MODIFIED,
  authorName = 'Prince (Raja)',
  authorUrl = 'https://quickkitai.com/about',
  breadcrumbs,
  includeArticle = true,
}) => {
  const siteName = 'Raja AI Systems';
  const defaultOgImage = ogImage || 'https://quickkitai.com/og-image.png';
  // Canonicals must always point to the production domain and exclude query/hash tracking parameters.
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? `https://quickkitai.com${window.location.pathname}` : 'https://quickkitai.com');
  const hasBrand = /Raja AI Systems|QuickKit\s?AI/i.test(title);
  const fullTitle = hasBrand ? title : `${title} | Raja AI Systems`;

  const personAuthor = {
    '@type': 'Person',
    name: authorName,
    url: authorUrl,
  };

  const publisherRef = {
    '@type': 'Organization',
    '@id': 'https://quickkitai.com/#organization',
    name: siteName,
    url: 'https://quickkitai.com',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://quickkitai.com/#organization',
    name: siteName,
    alternateName: 'QuickKitAI',
    url: 'https://quickkitai.com',
    founder: personAuthor,
    description: 'Managed AI automation and evidence-first AEO/GEO visibility systems for Indian real estate teams, with healthcare workflows available as secondary services.',
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: fullTitle,
    description,
    datePublished,
    dateModified,
    author: personAuthor,
    publisher: publisherRef,
  };

  const articleSchema = includeArticle
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: fullTitle,
        description,
        ...(articleBody ? { articleBody } : {}),
        mainEntityOfPage: canonicalUrl,
        url: canonicalUrl,
        author: personAuthor,
        datePublished,
        dateModified,
        publisher: publisherRef,
      }
    : null;

  const crumbItems = breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : buildDefaultBreadcrumbs(canonicalUrl, fullTitle);
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbItems.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={authorName} />
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

      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      {articleSchema && (
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      )}
      {schemaObj && (
        <script type="application/ld+json">{JSON.stringify(schemaObj)}</script>
      )}
    </Helmet>
  );
};

export const EditorialMetaBar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 ${className}`}>
    <span className="font-semibold text-slate-300">Last updated: 27 Nov 2026</span>
    <span aria-hidden="true">·</span>
    <span>
      Author:{' '}
      <Link to="/about" className="font-semibold text-amber-300 underline underline-offset-4 hover:text-amber-200">
        Prince / Raja
      </Link>
    </span>
  </div>
);

export const PublicRouteFooter: React.FC = () => (
  <footer className="border-t border-white/10 bg-slate-950/80 py-12 text-slate-400">
    <div className="mx-auto max-w-6xl px-5 md:px-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white">Explore QuickKitAI &amp; Raja AI Systems</p>
          <nav aria-label="Public site directory" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            {PUBLIC_SITEMAP_LINKS.map(link => (
              <Link key={link.to} to={link.to} className="text-slate-300 underline-offset-4 hover:text-amber-300 hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white">Technical Standards &amp; References</p>
          <ul className="mt-4 space-y-2 text-xs">
            {AUTHORITATIVE_DOCS_LINKS.map(doc => (
              <li key={doc.href}>
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 underline underline-offset-4 hover:text-emerald-300"
                >
                  {doc.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500">
        <span>© 2026 Raja AI Systems (QuickKitAI) · India</span>
        <span>Last updated: 27 Nov 2026 · Authored by Prince (Raja)</span>
      </div>
    </div>
  </footer>
);
