export interface SeoGlobal {
  id: number;
  default_title: string;
  title_template: string;
  default_description: string;
  default_og_image: string;
  default_robots: string;
  org_schema: any;
  product_schema_template: any;
  default_hreflang: string;
  default_region: string;
}

export interface SeoPage {
  id: string;
  page_identifier: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  canonical_url: string | null;
  robots: string | null;
  og_image: string | null;
  twitter_card: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeoProduct {
  id: string;
  product_id: string;
  custom_title: string | null;
  custom_description: string | null;
  custom_slug: string | null;
  faq_schema: any | null;
  rich_snippet_data: any | null;
  created_at: string;
  updated_at: string;
}

export interface SeoRedirect {
  id: string;
  from_url: string;
  to_url: string;
  type: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeoSitemap {
  id: string;
  path: string;
  is_enabled: boolean;
  priority: number;
  change_freq: string;
  updated_at: string;
}

export interface SeoContentBlock {
  id: string;
  entity_type: 'category' | 'product' | 'landing';
  entity_id: string;
  content_html: string | null;
  faq_json: any | null;
  created_at: string;
  updated_at: string;
}
