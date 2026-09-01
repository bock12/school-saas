'use server';

import { getPgPool } from '@/lib/db/pg-fallback';
import { revalidatePath } from 'next/cache';
import type {
  LandingPageItem,
  LandingPageSectionRecord,
  LandingPageSectionPayload,
  CmsPageRecord,
  CmsPagePayload,
  CmsPluginRecord,
  CmsMediaItem,
  CmsGlobalSettings,
  PluginKey,
} from '@/lib/types/landing-cms';
import {
  DEFAULT_LANDING_SECTIONS,
  DEFAULT_CMS_PAGES,
  DEFAULT_CMS_PLUGINS,
  DEFAULT_CMS_MEDIA,
  DEFAULT_CMS_SETTINGS,
  CMS_THEME_PRESETS,
} from '@/lib/types/landing-cms';

// Helper to ensure all CMS database tables exist
async function ensureCmsAllTablesExist() {
  try {
    const pool = getPgPool();
    if (!pool) return;

    // 1. Sections table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS landing_page_sections (
        id VARCHAR(100) PRIMARY KEY,
        section_key VARCHAR(100) UNIQUE NOT NULL,
        page_slug VARCHAR(100) DEFAULT 'home',
        block_type VARCHAR(50) DEFAULT 'hero',
        badge TEXT,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        primary_cta_text TEXT,
        primary_cta_url TEXT,
        secondary_cta_text TEXT,
        secondary_cta_url TEXT,
        is_published BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        items JSONB DEFAULT '[]'::jsonb,
        style_options JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Add any missing columns to existing landing_page_sections
    await pool.query(`
      ALTER TABLE landing_page_sections ADD COLUMN IF NOT EXISTS page_slug VARCHAR(100) DEFAULT 'home';
      ALTER TABLE landing_page_sections ADD COLUMN IF NOT EXISTS block_type VARCHAR(50) DEFAULT 'hero';
      ALTER TABLE landing_page_sections ADD COLUMN IF NOT EXISTS style_options JSONB DEFAULT '{}'::jsonb;
    `).catch(() => {});

    // 2. Pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_pages (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords TEXT,
        og_image_url TEXT,
        is_published BOOLEAN DEFAULT true,
        is_home BOOLEAN DEFAULT false,
        nav_order INT DEFAULT 0,
        show_in_header BOOLEAN DEFAULT true,
        show_in_footer BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Plugins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_plugins (
        id VARCHAR(100) PRIMARY KEY,
        plugin_key VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        category VARCHAR(50),
        is_enabled BOOLEAN DEFAULT false,
        config JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Media table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_media (
        id VARCHAR(100) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        url TEXT NOT NULL,
        file_type VARCHAR(50) DEFAULT 'image',
        category VARCHAR(50) DEFAULT 'campuses',
        size_bytes BIGINT DEFAULT 0,
        alt_text TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Global Settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_settings (
        id VARCHAR(50) PRIMARY KEY,
        site_name VARCHAR(255) DEFAULT 'SchoolSaaS',
        site_tagline TEXT,
        logo_url TEXT,
        favicon_url TEXT,
        primary_color VARCHAR(50) DEFAULT '#4f46e5',
        accent_color VARCHAR(50) DEFAULT '#3b82f6',
        font_family VARCHAR(100) DEFAULT 'Plus Jakarta Sans',
        custom_css TEXT,
        custom_head_scripts TEXT,
        custom_body_scripts TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.warn('[LandingCMS] Could not run CREATE TABLE for CMS suite:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// 1. SECTION MANAGEMENT ACTIONS
// ─────────────────────────────────────────────────────────────

export async function getLandingPageSections(pageSlug = 'home'): Promise<{ success: boolean; data: LandingPageSectionRecord[] }> {
  try {
    const pool = getPgPool();
    if (!pool) {
      return { success: true, data: DEFAULT_LANDING_SECTIONS.filter(s => (s.page_slug || 'home') === pageSlug) };
    }

    await ensureCmsAllTablesExist();
    const res = await pool.query(
      `SELECT * FROM landing_page_sections WHERE page_slug = $1 OR page_slug IS NULL ORDER BY sort_order ASC`,
      [pageSlug]
    );

    if (res.rows.length === 0 && pageSlug === 'home') {
      // Seed default sections
      for (const sec of DEFAULT_LANDING_SECTIONS) {
        await pool.query(
          `INSERT INTO landing_page_sections 
           (id, section_key, page_slug, block_type, badge, title, subtitle, description, primary_cta_text, primary_cta_url, secondary_cta_text, secondary_cta_url, is_published, sort_order, items, style_options)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (section_key) DO NOTHING`,
          [
            sec.id,
            sec.section_key,
            sec.page_slug || 'home',
            sec.block_type || 'hero',
            sec.badge,
            sec.title,
            sec.subtitle,
            sec.description || '',
            sec.primary_cta_text || '',
            sec.primary_cta_url || '',
            sec.secondary_cta_text || '',
            sec.secondary_cta_url || '',
            sec.is_published,
            sec.sort_order,
            JSON.stringify(sec.items || []),
            JSON.stringify(sec.style_options || {}),
          ]
        );
      }

      return { success: true, data: DEFAULT_LANDING_SECTIONS };
    }

    const sections: LandingPageSectionRecord[] = res.rows.map((r: any) => ({
      id: r.id,
      section_key: r.section_key,
      page_slug: r.page_slug || 'home',
      block_type: r.block_type || 'hero',
      badge: r.badge || '',
      title: r.title || '',
      subtitle: r.subtitle || '',
      description: r.description || '',
      primary_cta_text: r.primary_cta_text || '',
      primary_cta_url: r.primary_cta_url || '',
      secondary_cta_text: r.secondary_cta_text || '',
      secondary_cta_url: r.secondary_cta_url || '',
      is_published: r.is_published ?? true,
      sort_order: r.sort_order || 0,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
      style_options: typeof r.style_options === 'string' ? JSON.parse(r.style_options) : (r.style_options || {}),
      created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
    }));

    return { success: true, data: sections };
  } catch (err: any) {
    console.error('[LandingCMS] Error in getLandingPageSections:', err);
    return { success: true, data: DEFAULT_LANDING_SECTIONS };
  }
}

export async function updateLandingPageSection(
  sectionKey: string,
  payload: LandingPageSectionPayload
): Promise<{ success: boolean; data?: LandingPageSectionRecord; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database connection unavailable.' };

    await ensureCmsAllTablesExist();
    const res = await pool.query(
      `UPDATE landing_page_sections
       SET badge = $1,
           title = $2,
           subtitle = $3,
           description = $4,
           primary_cta_text = $5,
           primary_cta_url = $6,
           secondary_cta_text = $7,
           secondary_cta_url = $8,
           is_published = COALESCE($9, is_published),
           sort_order = COALESCE($10, sort_order),
           items = $11,
           style_options = $12,
           block_type = COALESCE($13, block_type),
           page_slug = COALESCE($14, page_slug),
           updated_at = NOW()
       WHERE section_key = $15
       RETURNING *`,
      [
        payload.badge,
        payload.title,
        payload.subtitle,
        payload.description || '',
        payload.primary_cta_text || '',
        payload.primary_cta_url || '',
        payload.secondary_cta_text || '',
        payload.secondary_cta_url || '',
        payload.is_published,
        payload.sort_order,
        JSON.stringify(payload.items || []),
        JSON.stringify(payload.style_options || {}),
        payload.block_type,
        payload.page_slug || 'home',
        sectionKey,
      ]
    );

    if (res.rows.length === 0) {
      const insertRes = await pool.query(
        `INSERT INTO landing_page_sections
         (id, section_key, page_slug, block_type, badge, title, subtitle, description, primary_cta_text, primary_cta_url, secondary_cta_text, secondary_cta_url, is_published, sort_order, items, style_options)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
          sectionKey,
          sectionKey,
          payload.page_slug || 'home',
          payload.block_type || 'hero',
          payload.badge,
          payload.title,
          payload.subtitle,
          payload.description || '',
          payload.primary_cta_text || '',
          payload.primary_cta_url || '',
          payload.secondary_cta_text || '',
          payload.secondary_cta_url || '',
          payload.is_published ?? true,
          payload.sort_order ?? 99,
          JSON.stringify(payload.items || []),
          JSON.stringify(payload.style_options || {}),
        ]
      );
      revalidatePath('/');
      revalidatePath('/super-admin/cms');
      return { success: true, data: insertRes.rows[0] };
    }

    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true, data: res.rows[0] };
  } catch (err: any) {
    console.error('[LandingCMS] Error in updateLandingPageSection:', err);
    return { success: false, error: err.message || 'Failed to update section' };
  }
}

export async function toggleLandingPageSectionVisibility(
  sectionKey: string,
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database connection unavailable.' };

    await ensureCmsAllTablesExist();
    await pool.query(
      `UPDATE landing_page_sections SET is_published = $1, updated_at = NOW() WHERE section_key = $2`,
      [isPublished, sectionKey]
    );
    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true };
  } catch (err: any) {
    console.error('[LandingCMS] Error in toggleLandingPageSectionVisibility:', err);
    return { success: false, error: err.message || 'Failed to toggle section visibility' };
  }
}

export async function createLandingPageSection(
  sectionKey: string,
  payload: LandingPageSectionPayload
): Promise<{ success: boolean; data?: LandingPageSectionRecord; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database connection unavailable.' };

    await ensureCmsAllTablesExist();
    const id = sectionKey.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const res = await pool.query(
      `INSERT INTO landing_page_sections
       (id, section_key, page_slug, block_type, badge, title, subtitle, description, primary_cta_text, primary_cta_url, secondary_cta_text, secondary_cta_url, is_published, sort_order, items, style_options)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        id,
        id,
        payload.page_slug || 'home',
        payload.block_type || 'hero',
        payload.badge,
        payload.title,
        payload.subtitle,
        payload.description || '',
        payload.primary_cta_text || '',
        payload.primary_cta_url || '',
        payload.secondary_cta_text || '',
        payload.secondary_cta_url || '',
        payload.is_published ?? true,
        payload.sort_order ?? 99,
        JSON.stringify(payload.items || []),
        JSON.stringify(payload.style_options || {}),
      ]
    );

    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true, data: res.rows[0] };
  } catch (err: any) {
    console.error('[LandingCMS] Error in createLandingPageSection:', err);
    return { success: false, error: err.message || 'Failed to create section' };
  }
}

export async function duplicateLandingPageSection(sectionKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable' };

    await ensureCmsAllTablesExist();
    const orig = await pool.query(`SELECT * FROM landing_page_sections WHERE section_key = $1`, [sectionKey]);
    if (orig.rows.length === 0) return { success: false, error: 'Original section not found' };

    const row = orig.rows[0];
    const newKey = `${row.section_key}-copy-${Date.now().toString().slice(-4)}`;
    await pool.query(
      `INSERT INTO landing_page_sections
       (id, section_key, page_slug, block_type, badge, title, subtitle, description, primary_cta_text, primary_cta_url, secondary_cta_text, secondary_cta_url, is_published, sort_order, items, style_options)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        newKey,
        newKey,
        row.page_slug || 'home',
        row.block_type || 'hero',
        row.badge,
        `${row.title} (Copy)`,
        row.subtitle,
        row.description || '',
        row.primary_cta_text || '',
        row.primary_cta_url || '',
        row.secondary_cta_text || '',
        row.secondary_cta_url || '',
        false, // start duplicated section as draft
        (row.sort_order || 0) + 1,
        JSON.stringify(row.items || []),
        JSON.stringify(row.style_options || {}),
      ]
    );

    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reorderLandingPageSections(orderedKeys: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database connection unavailable.' };

    await ensureCmsAllTablesExist();
    for (let i = 0; i < orderedKeys.length; i++) {
      await pool.query(
        `UPDATE landing_page_sections SET sort_order = $1, updated_at = NOW() WHERE section_key = $2`,
        [i + 1, orderedKeys[i]]
      );
    }

    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true };
  } catch (err: any) {
    console.error('[LandingCMS] Error in reorderLandingPageSections:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteLandingPageSection(sectionKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database connection unavailable.' };

    await ensureCmsAllTablesExist();
    await pool.query(`DELETE FROM landing_page_sections WHERE section_key = $1`, [sectionKey]);
    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true };
  } catch (err: any) {
    console.error('[LandingCMS] Error in deleteLandingPageSection:', err);
    return { success: false, error: err.message || 'Failed to delete section' };
  }
}

export async function resetLandingPageSection(sectionKey: string): Promise<{ success: boolean; data?: LandingPageSectionRecord; error?: string }> {
  const defaultSec = DEFAULT_LANDING_SECTIONS.find(s => s.section_key === sectionKey);
  if (!defaultSec) {
    return { success: false, error: 'No default configuration found for this section key' };
  }
  return updateLandingPageSection(sectionKey, {
    badge: defaultSec.badge,
    title: defaultSec.title,
    subtitle: defaultSec.subtitle,
    description: defaultSec.description,
    primary_cta_text: defaultSec.primary_cta_text,
    primary_cta_url: defaultSec.primary_cta_url,
    secondary_cta_text: defaultSec.secondary_cta_text,
    secondary_cta_url: defaultSec.secondary_cta_url,
    is_published: defaultSec.is_published,
    sort_order: defaultSec.sort_order,
    block_type: defaultSec.block_type,
    page_slug: defaultSec.page_slug,
    items: defaultSec.items,
    style_options: defaultSec.style_options,
  });
}

// ─────────────────────────────────────────────────────────────
// 2. MULTI-PAGE ENGINE ACTIONS
// ─────────────────────────────────────────────────────────────

export async function getCmsPages(): Promise<{ success: boolean; data: CmsPageRecord[] }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: true, data: DEFAULT_CMS_PAGES };

    await ensureCmsAllTablesExist();
    const res = await pool.query(`SELECT * FROM cms_pages ORDER BY nav_order ASC`);

    if (res.rows.length === 0) {
      for (const page of DEFAULT_CMS_PAGES) {
        await pool.query(
          `INSERT INTO cms_pages 
           (id, title, slug, description, seo_title, seo_description, seo_keywords, og_image_url, is_published, is_home, nav_order, show_in_header, show_in_footer)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (slug) DO NOTHING`,
          [
            page.id,
            page.title,
            page.slug,
            page.description || '',
            page.seo_title || '',
            page.seo_description || '',
            page.seo_keywords || '',
            page.og_image_url || '',
            page.is_published,
            page.is_home,
            page.nav_order,
            page.show_in_header,
            page.show_in_footer,
          ]
        );
      }
      return { success: true, data: DEFAULT_CMS_PAGES };
    }

    return {
      success: true,
      data: res.rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        description: r.description || '',
        seo_title: r.seo_title || '',
        seo_description: r.seo_description || '',
        seo_keywords: r.seo_keywords || '',
        og_image_url: r.og_image_url || '',
        is_published: r.is_published ?? true,
        is_home: r.is_home ?? false,
        nav_order: r.nav_order || 0,
        show_in_header: r.show_in_header ?? true,
        show_in_footer: r.show_in_footer ?? true,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      })),
    };
  } catch (err: any) {
    console.error('[LandingCMS] Error in getCmsPages:', err);
    return { success: true, data: DEFAULT_CMS_PAGES };
  }
}

export async function createCmsPage(payload: CmsPagePayload): Promise<{ success: boolean; data?: CmsPageRecord; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable' };

    await ensureCmsAllTablesExist();
    const cleanSlug = payload.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
    const id = `page_${cleanSlug}_${Date.now().toString().slice(-4)}`;

    const res = await pool.query(
      `INSERT INTO cms_pages 
       (id, title, slug, description, seo_title, seo_description, seo_keywords, og_image_url, is_published, is_home, nav_order, show_in_header, show_in_footer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        id,
        payload.title,
        cleanSlug,
        payload.description || '',
        payload.seo_title || payload.title,
        payload.seo_description || '',
        payload.seo_keywords || '',
        payload.og_image_url || '',
        payload.is_published ?? true,
        payload.is_home ?? false,
        payload.nav_order ?? 99,
        payload.show_in_header ?? true,
        payload.show_in_footer ?? true,
      ]
    );

    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true, data: res.rows[0] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCmsPage(
  pageId: string,
  payload: CmsPagePayload
): Promise<{ success: boolean; data?: CmsPageRecord; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable' };

    await ensureCmsAllTablesExist();
    const res = await pool.query(
      `UPDATE cms_pages
       SET title = $1,
           slug = $2,
           description = $3,
           seo_title = $4,
           seo_description = $5,
           seo_keywords = $6,
           og_image_url = $7,
           is_published = COALESCE($8, is_published),
           nav_order = COALESCE($9, nav_order),
           show_in_header = COALESCE($10, show_in_header),
           show_in_footer = COALESCE($11, show_in_footer),
           updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [
        payload.title,
        payload.slug,
        payload.description || '',
        payload.seo_title || payload.title,
        payload.seo_description || '',
        payload.seo_keywords || '',
        payload.og_image_url || '',
        payload.is_published,
        payload.nav_order,
        payload.show_in_header,
        payload.show_in_footer,
        pageId,
      ]
    );

    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true, data: res.rows[0] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCmsPage(pageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable' };

    await ensureCmsAllTablesExist();
    await pool.query(`DELETE FROM cms_pages WHERE id = $1 AND is_home = false`, [pageId]);
    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 3. PLUGIN SUITE ACTIONS
// ─────────────────────────────────────────────────────────────

export async function getCmsPlugins(): Promise<{ success: boolean; data: CmsPluginRecord[] }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: true, data: DEFAULT_CMS_PLUGINS };

    await ensureCmsAllTablesExist();
    const res = await pool.query(`SELECT * FROM cms_plugins ORDER BY name ASC`);

    if (res.rows.length === 0) {
      for (const p of DEFAULT_CMS_PLUGINS) {
        await pool.query(
          `INSERT INTO cms_plugins (id, plugin_key, name, description, icon, category, is_enabled, config)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (plugin_key) DO NOTHING`,
          [p.id, p.plugin_key, p.name, p.description, p.icon, p.category, p.is_enabled, JSON.stringify(p.config)]
        );
      }
      return { success: true, data: DEFAULT_CMS_PLUGINS };
    }

    return {
      success: true,
      data: res.rows.map((r: any) => ({
        id: r.id,
        plugin_key: r.plugin_key,
        name: r.name,
        description: r.description,
        icon: r.icon,
        category: r.category,
        is_enabled: r.is_enabled ?? false,
        config: typeof r.config === 'string' ? JSON.parse(r.config) : (r.config || {}),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      })),
    };
  } catch (err: any) {
    console.error('[LandingCMS] Error in getCmsPlugins:', err);
    return { success: true, data: DEFAULT_CMS_PLUGINS };
  }
}

export async function updateCmsPlugin(
  pluginKey: PluginKey,
  isEnabled: boolean,
  config: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable' };

    await ensureCmsAllTablesExist();
    await pool.query(
      `UPDATE cms_plugins
       SET is_enabled = $1, config = $2, updated_at = NOW()
       WHERE plugin_key = $3`,
      [isEnabled, JSON.stringify(config), pluginKey]
    );

    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 4. MEDIA LIBRARY ACTIONS
// ─────────────────────────────────────────────────────────────

export async function getCmsMedia(): Promise<{ success: boolean; data: CmsMediaItem[] }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: true, data: DEFAULT_CMS_MEDIA };

    await ensureCmsAllTablesExist();
    const res = await pool.query(`SELECT * FROM cms_media ORDER BY created_at DESC`);

    if (res.rows.length === 0) {
      for (const m of DEFAULT_CMS_MEDIA) {
        await pool.query(
          `INSERT INTO cms_media (id, filename, title, url, file_type, category, alt_text)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [m.id, m.filename, m.title, m.url, m.file_type, m.category, m.alt_text]
        );
      }
      return { success: true, data: DEFAULT_CMS_MEDIA };
    }

    return {
      success: true,
      data: res.rows.map((r: any) => ({
        id: r.id,
        filename: r.filename,
        title: r.title || r.filename,
        url: r.url,
        file_type: r.file_type || 'image',
        category: r.category || 'campuses',
        size_bytes: r.size_bytes || 0,
        alt_text: r.alt_text || '',
        created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      })),
    };
  } catch (err: any) {
    return { success: true, data: DEFAULT_CMS_MEDIA };
  }
}

export async function addCmsMedia(item: Omit<CmsMediaItem, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable' };

    await ensureCmsAllTablesExist();
    const id = `media_${Date.now()}`;
    await pool.query(
      `INSERT INTO cms_media (id, filename, title, url, file_type, category, size_bytes, alt_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, item.filename, item.title, item.url, item.file_type || 'image', item.category || 'general', item.size_bytes || 0, item.alt_text || '']
    );

    revalidatePath('/super-admin/cms');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCmsMedia(mediaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable' };

    await ensureCmsAllTablesExist();
    await pool.query(`DELETE FROM cms_media WHERE id = $1`, [mediaId]);
    revalidatePath('/super-admin/cms');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 5. GLOBAL STYLING & SETTINGS ACTIONS
// ─────────────────────────────────────────────────────────────

export async function getCmsSettings(): Promise<{ success: boolean; data: CmsGlobalSettings }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: true, data: DEFAULT_CMS_SETTINGS };

    await ensureCmsAllTablesExist();
    const res = await pool.query(`SELECT * FROM cms_settings WHERE id = 'global_settings' LIMIT 1`);

    if (res.rows.length === 0) {
      await pool.query(
        `INSERT INTO cms_settings (id, site_name, site_tagline, logo_url, primary_color, accent_color, font_family, custom_css, custom_head_scripts, custom_body_scripts)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          'global_settings',
          DEFAULT_CMS_SETTINGS.site_name,
          DEFAULT_CMS_SETTINGS.site_tagline,
          DEFAULT_CMS_SETTINGS.logo_url,
          DEFAULT_CMS_SETTINGS.primary_color,
          DEFAULT_CMS_SETTINGS.accent_color,
          DEFAULT_CMS_SETTINGS.font_family,
          DEFAULT_CMS_SETTINGS.custom_css,
          DEFAULT_CMS_SETTINGS.custom_head_scripts,
          DEFAULT_CMS_SETTINGS.custom_body_scripts,
        ]
      );
      return { success: true, data: DEFAULT_CMS_SETTINGS };
    }

    const r = res.rows[0];
    return {
      success: true,
      data: {
        id: r.id,
        site_name: r.site_name || 'SchoolSaaS',
        site_tagline: r.site_tagline || '',
        logo_url: r.logo_url || '',
        favicon_url: r.favicon_url || '',
        primary_color: r.primary_color || '#4f46e5',
        accent_color: r.accent_color || '#3b82f6',
        font_family: r.font_family || 'Plus Jakarta Sans',
        custom_css: r.custom_css || '',
        custom_head_scripts: r.custom_head_scripts || '',
        custom_body_scripts: r.custom_body_scripts || '',
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      },
    };
  } catch (err: any) {
    return { success: true, data: DEFAULT_CMS_SETTINGS };
  }
}

export async function updateCmsSettings(settings: CmsGlobalSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable' };

    await ensureCmsAllTablesExist();
    await pool.query(
      `INSERT INTO cms_settings (id, site_name, site_tagline, logo_url, primary_color, accent_color, font_family, custom_css, custom_head_scripts, custom_body_scripts, updated_at)
       VALUES ('global_settings', $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (id) DO UPDATE
       SET site_name = $1,
           site_tagline = $2,
           logo_url = $3,
           primary_color = $4,
           accent_color = $5,
           font_family = $6,
           custom_css = $7,
           custom_head_scripts = $8,
           custom_body_scripts = $9,
           updated_at = NOW()`,
      [
        settings.site_name,
        settings.site_tagline || '',
        settings.logo_url || '',
        settings.primary_color || '#4f46e5',
        settings.accent_color || '#3b82f6',
        settings.font_family || 'Plus Jakarta Sans',
        settings.custom_css || '',
        settings.custom_head_scripts || '',
        settings.custom_body_scripts || '',
      ]
    );

    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 6. TEMPLATE PRESET APPLICATION
// ─────────────────────────────────────────────────────────────

export async function applyCmsTemplatePreset(presetId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database connection unavailable' };

    const preset = CMS_THEME_PRESETS.find(p => p.id === presetId);
    if (!preset) return { success: false, error: 'Preset template not found' };

    await ensureCmsAllTablesExist();

    // Reset sections for home page
    await pool.query(`DELETE FROM landing_page_sections WHERE page_slug = 'home' OR page_slug IS NULL`);

    for (let i = 0; i < preset.sections.length; i++) {
      const sec = preset.sections[i];
      await pool.query(
        `INSERT INTO landing_page_sections 
         (id, section_key, page_slug, block_type, badge, title, subtitle, description, primary_cta_text, primary_cta_url, secondary_cta_text, secondary_cta_url, is_published, sort_order, items, style_options)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          sec.id,
          sec.section_key,
          'home',
          sec.block_type || 'hero',
          sec.badge,
          sec.title,
          sec.subtitle,
          sec.description || '',
          sec.primary_cta_text || '',
          sec.primary_cta_url || '',
          sec.secondary_cta_text || '',
          sec.secondary_cta_url || '',
          true,
          i + 1,
          JSON.stringify(sec.items || []),
          JSON.stringify(sec.style_options || {}),
        ]
      );
    }

    revalidatePath('/');
    revalidatePath('/super-admin/cms');
    return { success: true };
  } catch (err: any) {
    console.error('[LandingCMS] Error in applyCmsTemplatePreset:', err);
    return { success: false, error: err.message };
  }
}