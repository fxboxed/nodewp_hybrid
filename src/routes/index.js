// src/routes/index.js
import { Router } from 'express';
import axios from 'axios';
import { posts as dummyPosts, paginate } from '../data/dummy.js';

const router = Router();
const USE_WP = (process.env.USE_WP_API || '').toLowerCase() === 'true';
const WP = process.env.WP_API_URL || '';

function stripHtml(html = '') {
  return String(html).replace(/<\/?[^>]+(>|$)/g, '').trim();
}

async function fetchWpPosts(page = 1, perPage = 5) {
  const url = `${WP}/posts`;
  const resp = await axios.get(url, { params: { per_page: perPage, page, _embed: 1 } });
  const totalPages = parseInt(resp.headers['x-wp-totalpages'] || '1', 10) || 1;

  const mapped = resp.data.map(p => {
    // Try to read first category/tag names if embedded; else fall back
    let categoryName = 'Uncategorized';
    if (p._embedded && p._embedded['wp:term']) {
      const cats = p._embedded['wp:term'][0] || [];
      if (cats[0] && cats[0].name) categoryName = cats[0].name;
    }
    return {
      slug: p.slug,
      title: stripHtml(p.title?.rendered || 'Untitled'),
      excerpt: stripHtml(p.excerpt?.rendered || ''),
      category: 'uncategorized',
      categoryName
    };
  });

  return { items: mapped, page, totalPages };
}

// Index page (page 1)
router.get('/', async (req, res) => {
  if (USE_WP && WP) {
    try {
      const data = await fetchWpPosts(1, 5);
      return res.render('index', {
        title: 'Home',
        posts: data.items,
        page: data.page,
        totalPages: data.totalPages,
        basePath: ''
      });
    } catch (e) {
      console.error('WP index fetch failed, falling back to dummy:', e.message);
    }
  }
  // Fallback to dummy data
  const pageData = paginate(dummyPosts, 1, 5);
  res.render('index', {
    title: 'Home',
    posts: pageData.items,
    page: pageData.page,
    totalPages: pageData.totalPages,
    basePath: ''
  });
});

// Index pagination: /page/:page
router.get('/page/:page', async (req, res) => {
  const pageNum = Math.max(1, parseInt(req.params.page || '1', 10));
  if (USE_WP && WP) {
    try {
      const data = await fetchWpPosts(pageNum, 5);
      if (pageNum > data.totalPages) {
        return res.status(404).render('404', { title: 'Not found' });
      }
      return res.render('index', {
        title: `Home — Page ${data.page}`,
        posts: data.items,
        page: data.page,
        totalPages: data.totalPages,
        basePath: 'page'
      });
    } catch (e) {
      console.error('WP index page fetch failed, falling back to dummy:', e.message);
    }
  }
  // Fallback to dummy
  const pageData = paginate(dummyPosts, pageNum, 5);
  if (pageData.page > pageData.totalPages) {
    return res.status(404).render('404', { title: 'Not found' });
  }
  res.render('index', {
    title: `Home — Page ${pageData.page}`,
    posts: pageData.items,
    page: pageData.page,
    totalPages: pageData.totalPages,
    basePath: 'page'
  });
});

export default router;

