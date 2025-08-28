// src/routes/taxonomies.js
import { Router } from 'express';
import axios from 'axios';
import {
  categories as dummyCategories,
  tags as dummyTags,
  getPostsByCategory,
  getPostsByTag,
  paginate
} from '../data/dummy.js';

const router = Router();
const USE_WP = (process.env.USE_WP_API || '').toLowerCase() === 'true';
const WP = process.env.WP_API_URL || '';

function stripHtml(html = '') {
  return String(html).replace(/<\/?[^>]+(>|$)/g, '').trim();
}

async function getWpCategoryBySlug(slug) {
  const { data } = await axios.get(`${WP}/categories`, { params: { slug } });
  return data[0] || null;
}

async function getWpTagBySlug(slug) {
  const { data } = await axios.get(`${WP}/tags`, { params: { slug } });
  return data[0] || null;
}

async function getWpPostsByCategoryId(catId, page = 1, perPage = 5) {
  const resp = await axios.get(`${WP}/posts`, {
    params: { categories: catId, per_page: perPage, page, _embed: 1 }
  });
  const totalPages = parseInt(resp.headers['x-wp-totalpages'] || '1', 10) || 1;
  const items = resp.data.map(p => ({
    slug: p.slug,
    title: stripHtml(p.title?.rendered || 'Untitled'),
    excerpt: stripHtml(p.excerpt?.rendered || '')
  }));
  return { items, page, totalPages };
}

async function getWpPostsByTagId(tagId) {
  // Single page (up to 20) for now
  const resp = await axios.get(`${WP}/posts`, {
    params: { tags: tagId, per_page: 20, _embed: 1 }
  });
  const items = resp.data.map(p => ({
    slug: p.slug,
    title: stripHtml(p.title?.rendered || 'Untitled'),
    excerpt: stripHtml(p.excerpt?.rendered || '')
  }));
  return items;
}

// Shared route for both: /taxonomy/:type/:slug
router.get('/taxonomy/:type/:slug', async (req, res) => {
  const { type, slug } = req.params;

  if (type !== 'category' && type !== 'tag') {
    return res.status(404).render('404', { title: 'Not found' });
  }

  if (USE_WP && WP) {
    try {
      if (type === 'category') {
        const cat = await getWpCategoryBySlug(slug);
        if (!cat) return res.status(404).render('404', { title: 'Not found' });

        const currentPage = Math.max(1, parseInt(req.query.page || '1', 10));
        const data = await getWpPostsByCategoryId(cat.id, currentPage, 5);

        return res.render('taxonomy', {
          title: `${cat.name} — Category`,
          type,
          slug,
          taxonomyName: cat.name,
          posts: data.items,
          page: data.page,
          totalPages: data.totalPages,
          paginationBase: `/taxonomy/category/${slug}`
        });
      }

      if (type === 'tag') {
        const tg = await getWpTagBySlug(slug);
        if (!tg) return res.status(404).render('404', { title: 'Not found' });

        const posts = await getWpPostsByTagId(tg.id);
        return res.render('taxonomy', {
          title: `${tg.name} — Tag`,
          type,
          slug,
          taxonomyName: tg.name,
          posts,
          page: 1,
          totalPages: 1,
          paginationBase: null
        });
      }
    } catch (e) {
      console.error('WP taxonomy fetch failed, falling back to dummy:', e.message);
      // continue to fallback below
    }
  }

  // ---- Fallback to dummy data ----
  if (type === 'category') {
    const cat = dummyCategories.find(c => c.slug === slug);
    if (!cat) return res.status(404).render('404', { title: 'Not found' });
    const currentPage = Math.max(1, parseInt(req.query.page || '1', 10));
    const results = getPostsByCategory(slug);
    const pageData = paginate(results, currentPage, 5);
    return res.render('taxonomy', {
      title: `${cat.name} — Category`,
      type,
      slug,
      taxonomyName: cat.name,
      posts: pageData.items,
      page: pageData.page,
      totalPages: pageData.totalPages,
      paginationBase: `/taxonomy/category/${slug}`
    });
  }

  if (type === 'tag') {
    const tg = dummyTags.find(t => t.slug === slug);
    if (!tg) return res.status(404).render('404', { title: 'Not found' });
    const results = getPostsByTag(slug);
    return res.render('taxonomy', {
      title: `${tg.name} — Tag`,
      type,
      slug,
      taxonomyName: tg.name,
      posts: results,
      page: 1,
      totalPages: 1,
      paginationBase: null
    });
  }
});

export default router;
