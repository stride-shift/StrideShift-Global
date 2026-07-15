import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  name?: string;
  imageUrl?: string;
  publishDate?: string;
  modifiedDate?: string;
  author?: string;
  category?: string;
  keywords?: string[];
  isBlogPost?: boolean;
}

const SITE_NAME = 'StrideShift Global';
const SITE_URL = 'https://www.strideshift.ai';
const DEFAULT_KEYWORDS = [
  'AI strategy',
  'AI advisory',
  'AI consulting',
  'decision intelligence',
  'AI reasoning',
  'AI for leadership',
  'AI-enabled strategy',
];

const SEO: React.FC<SEOProps> = ({
  title = 'StrideShift — AI-powered think tank for leaders',
  description = 'StrideShift is an AI-powered think tank for teams facing complex, open-ended challenges. From messy problem to clear action — in days, not months.',
  type = 'website',
  name = SITE_NAME,
  imageUrl = '/og-image.png',
  publishDate,
  modifiedDate,
  author,
  category,
  keywords = DEFAULT_KEYWORDS,
  isBlogPost = false,
}) => {
  const location = useLocation();
  const currentUrl = `${SITE_URL}${location.pathname}`;
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;

  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AI-powered think tank for teams facing complex, open-ended challenges.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hq@strideshift.ai',
    },
  };

  const blogPostStructuredData =
    isBlogPost && publishDate
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          mainEntityOfPage: { '@type': 'WebPage', '@id': currentUrl },
          headline: title,
          image: { '@type': 'ImageObject', url: absoluteImageUrl, width: 1200, height: 630 },
          datePublished: publishDate,
          dateModified: modifiedDate || publishDate,
          author: { '@type': 'Organization', name: author || SITE_NAME, url: SITE_URL },
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
          },
          description,
          keywords: keywords.join(', '),
          articleSection: category,
          inLanguage: 'en-US',
          isAccessibleForFree: true,
        }
      : null;

  const keywordString = category ? [...keywords, category.toLowerCase()].join(', ') : keywords.join(', ');

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
      <meta name="keywords" content={keywordString} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

      <meta property="og:type" content={isBlogPost ? 'article' : type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {isBlogPost && category && <meta property="article:section" content={category} />}
      {isBlogPost && publishDate && <meta property="article:published_time" content={publishDate} />}
      {isBlogPost && modifiedDate && <meta property="article:modified_time" content={modifiedDate} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />

      <meta name="author" content={author || name} />
      {/* New "Angle" palette ink — matches the deep section backgrounds */}
      <meta name="theme-color" content="#0F1620" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#080C13" media="(prefers-color-scheme: dark)" />

      <script type="application/ld+json">{JSON.stringify(organizationStructuredData)}</script>
      {blogPostStructuredData && (
        <script type="application/ld+json">{JSON.stringify(blogPostStructuredData)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
