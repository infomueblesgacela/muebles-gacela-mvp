/**
 * Muebles Gacela - Google Analytics 4 & Google Tag Manager DataLayer Tracker
 * Standardized E-Commerce & Product Engagement Tracking
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface AnalyticsProduct {
  sku: string;
  title: string;
  linea?: string;
  ambiente?: string;
  color?: string;
}

// Safe push to dataLayer & direct gtag trigger for GA4
const pushToDataLayer = (eventPayload: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventPayload);

    // Direct GA4 gtag dispatch
    if (typeof window.gtag === 'function') {
      const { event, ...params } = eventPayload;
      if (event) {
        window.gtag('event', event, params);
      }
    }

    // Optional console log for development debugging
    if (import.meta.env.DEV) {
      console.log('[Analytics Event]:', eventPayload);
    }
  }
};

/**
 * 1. Track Page View
 */
export const trackPageView = (pageTitle: string, pagePath: string) => {
  pushToDataLayer({
    event: 'page_view',
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath,
  });
};

/**
 * 2. Track Product View (view_item - GA4 Standard & Page View Enrichment)
 */
export const trackProductView = (product: AnalyticsProduct) => {
  // 1. Send GA4 Standard E-Commerce view_item
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      items: [
        {
          item_id: product.sku,
          item_name: product.title,
          item_category: product.linea || 'General',
          item_category2: product.ambiente || 'General',
          item_variant: product.color || 'Estándar',
        },
      ],
    },
    product_sku: product.sku,
    product_name: product.title,
    product_linea: product.linea || '',
    product_ambiente: product.ambiente || '',
  });

  // 2. Also enrich page_view so Looker Studio metrics like "Vistas" (Page Views) work seamlessly
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: product.title,
      page_location: window.location.href,
      product_sku: product.sku,
      product_name: product.title,
      product_linea: product.linea || '',
      product_ambiente: product.ambiente || '',
    });
  }
};

/**
 * 3. Track Product Card Click (select_item - GA4 Standard)
 */
export const trackProductClick = (product: AnalyticsProduct, itemListName: string = 'Catalog Grid') => {
  pushToDataLayer({
    event: 'select_item',
    ecommerce: {
      item_list_name: itemListName,
      items: [
        {
          item_id: product.sku,
          item_name: product.title,
          item_category: product.linea || 'General',
          item_category2: product.ambiente || 'General',
        },
      ],
    },
    product_sku: product.sku,
    product_name: product.title,
    source_list: itemListName,
  });
};

/**
 * 4. Track 3D Viewer Engagement (view_3d_model)
 */
export const track3DView = (product: AnalyticsProduct, mode: 'interactive_viewer' | 'quick_look' = 'interactive_viewer') => {
  pushToDataLayer({
    event: 'view_3d_model',
    product_sku: product.sku,
    product_name: product.title,
    product_linea: product.linea || '',
    viewer_mode: mode,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 5. Track Augmented Reality Experience Launch (start_ar_experience)
 */
export const trackARStart = (product: AnalyticsProduct, platform: 'google_scene_viewer' | 'apple_quicklook' | 'web_fallback' = 'google_scene_viewer') => {
  pushToDataLayer({
    event: 'start_ar_experience',
    product_sku: product.sku,
    product_name: product.title,
    product_linea: product.linea || '',
    ar_platform: platform,
    device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    timestamp: new Date().toISOString(),
  });
};

/**
 * 6. Track Guided Assembly Start & Progress (view_assembly_guide)
 */
export const trackAssemblyStart = (product: AnalyticsProduct) => {
  pushToDataLayer({
    event: 'view_assembly_guide',
    product_sku: product.sku,
    product_name: product.title,
    product_linea: product.linea || '',
    guide_type: 'step_by_step_3d',
    timestamp: new Date().toISOString(),
  });
};

/**
 * 7. Track Manual PDF Download (download_manual_pdf)
 */
export const trackManualDownload = (product: AnalyticsProduct, pdfUrl?: string) => {
  pushToDataLayer({
    event: 'download_manual_pdf',
    product_sku: product.sku,
    product_name: product.title,
    product_linea: product.linea || '',
    pdf_url: pdfUrl || '',
    timestamp: new Date().toISOString(),
  });
};

/**
 * 8. Track Catalog Filtering & Search (filter_catalog)
 */
export const trackCatalogFilter = (filterType: 'linea' | 'ambiente' | 'search', filterValue: string) => {
  if (!filterValue || filterValue === 'Todas' || filterValue === 'Todos') return;
  pushToDataLayer({
    event: 'filter_catalog',
    filter_type: filterType,
    filter_value: filterValue,
  });
};
