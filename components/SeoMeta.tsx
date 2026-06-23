import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoMetaProps {
  title: string;
  description: string;
  keywords: string;
  schemaObj?: object;
}

export const SeoMeta: React.FC<SeoMetaProps> = ({ title, description, keywords, schemaObj }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {schemaObj && (
        <script type="application/ld+json">
          {JSON.stringify(schemaObj)}
        </script>
      )}
    </Helmet>
  );
};
