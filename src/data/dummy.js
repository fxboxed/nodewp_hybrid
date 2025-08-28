// src/data/dummy.js
// This file simulates WordPress data so we can test routes & pagination now.
// Later, we will replace this with live WordPress REST API via Axios.

const categories = [
  // Each category has a slug and name
  { slug: 'news', name: 'News' },
  { slug: 'reviews', name: 'Reviews' },
  { slug: 'guides', name: 'Guides' }
];

const tags = [
  // Each tag has a slug and name
  { slug: 'linux', name: 'Linux' },
  { slug: 'nodejs', name: 'Node.js' },
  { slug: 'wordpress', name: 'WordPress' }
];

// Create 25 dummy posts so pagination is obvious (index + category pages)
const posts = Array.from({ length: 25 }).map((_, i) => {
  const id = i + 1;
  const category = categories[id % categories.length]; // rotate categories
  const tag = tags[id % tags.length];                  // rotate tags
  return {
    id,
    slug: `post-${id}`,
    title: `Dummy Post ${id}`,
    excerpt: `This is a short excerpt for Dummy Post ${id}.`,
    content: `# Dummy Post ${id}\n\nThis is the full content of Dummy Post ${id}. It demonstrates the single post page.`,
    category: category.slug,
    categoryName: category.name,
    tags: [tag.slug],
    tagNames: [tag.name],
    date: new Date(Date.now() - id * 86400000).toISOString() // spread dates
  };
});

/**
 * Helpers for pagination & filtering
 */
function paginate(items, page = 1, perPage = 5) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const start = (p - 1) * perPage;
  const end = start + perPage;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return {
    items: items.slice(start, end),
    page: p,
    perPage,
    total,
    totalPages
  };
}

function getPostsByCategory(slug) {
  return posts.filter(p => p.category === slug);
}

function getPostsByTag(slug) {
  return posts.filter(p => p.tags.includes(slug));
}

function getPostBySlug(slug) {
  return posts.find(p => p.slug === slug);
}

export {
  posts,
  categories,
  tags,
  paginate,
  getPostsByCategory,
  getPostsByTag,
  getPostBySlug
};
