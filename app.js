// app.js
// Entry point of the Node app: sets up Express, sessions, Pug, static files,
// and mounts our routes. NO WordPress yet — just dummy data.

import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env (stored inside the app, as requested)
dotenv.config();

// Work out __dirname (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic app config
app.set('view engine', 'pug');
// Views live in /src/views
app.set('views', path.join(__dirname, 'src', 'views'));

// Parse form data & JSON if you add forms later
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions & flash messages (required by your dependency list)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_me',
    resave: false,
    saveUninitialized: false
  })
);
app.use(flash());

// Make flash messages available to all templates
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Serve static files (images, css, client js)
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes (we split routes into separate files)
import indexRoutes from './src/routes/index.js';
import pageRoutes from './src/routes/pages.js';
import taxonomyRoutes from './src/routes/taxonomies.js';
import postRoutes from './src/routes/posts.js';
import notFoundRoutes from './src/routes/notFound.js';

app.use('/', indexRoutes);            // Homepage + index pagination
app.use('/', pageRoutes);             // About / Terms / Privacy (shared route)
app.use('/', taxonomyRoutes);         // Categories + Tags (shared route)
app.use('/', postRoutes);             // Single post
app.use(notFoundRoutes);              // 404 fallback (must be last)

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`nodewp_hybrid is running at http://localhost:${PORT}`);
});
