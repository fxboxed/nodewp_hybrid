// src/routes/pages.js
import { Router } from 'express';

const router = Router();

// We share one route for 3 required pages:
// /required/about
// /required/terms-of-service
// /required/privacy-policy
router.get('/required/:page', (req, res) => {
  const { page } = req.params;
  const map = {
    'about': { title: 'About', body: 'This is the About page.' },
    'terms-of-service': { title: 'Terms of Service', body: 'Your terms go here.' },
    'privacy-policy': { title: 'Privacy Policy', body: 'Your privacy policy goes here.' }
  };

  const info = map[page];
  if (!info) {
    return res.status(404).render('404', { title: 'Not found' });
  }

  res.render('legal', {
    title: info.title,
    body: info.body
  });
});

export default router;
