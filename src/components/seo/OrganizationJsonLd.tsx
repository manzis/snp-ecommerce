import React from 'react';

export default function OrganizationJsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Supplyment Nepal',
    alternateName: 'Supplyment Nepal',
    legalName: 'Supplyment Nepal',
    url: 'https://www.brightsupplements.store',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.brightsupplements.store/icon.png',
      width: 200,
      height: 60,
    },
    description:
      'Supplyment Nepal — Nepal\'s most trusted online supplement store. Buy authentic whey protein, mass gainers, creatine, pre-workout, and vitamins with fast nationwide delivery.',
    foundingDate: '2023',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP',
      addressLocality: 'Kathmandu',
      addressRegion: 'Bagmati Province',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Nepali'],
    },
    sameAs: [
      'https://www.facebook.com/brightsupplementsnepal',
      'https://www.instagram.com/brightsupplements.np',
      'https://www.brightsupplements.store',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Nepal',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Supplyment Nepal',
    alternateName: 'Supplyment Nepal',
    url: 'https://www.brightsupplements.store',
    description: 'Buy authentic supplements in Nepal — best prices on protein, creatine & more at Supplyment Nepal.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.brightsupplements.store/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
