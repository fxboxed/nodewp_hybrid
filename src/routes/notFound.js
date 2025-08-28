// src/routes/notFound.js
import { Router } from 'express';

const router = Router();

// This must be the last route mounted in app.js
router.use((req, res) => {
  res.status(404).render('404', { title: 'Page not found' });
});

export default router;
