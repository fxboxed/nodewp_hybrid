// src/routes/posts.js
import { Router } from 'express';
import { getPostBySlug } from '../data/dummy.js';

const router = Router();

// Single post dynamic route: /post/:slug
router.get('/post/:slug', (req, res) => {
  const { slug } = req.params;
  const post = getPostBySlug(slug);
  if (!post) {
    return res.status(404).render('404', { title: 'Not found' });
  }
  res.render('post', {
    title: post.title,
    post
  });
});

export default router;
