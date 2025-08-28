document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  if (!input || !results) {
    console.warn('Search input or results container not found.');
    return;
  }

  input.addEventListener('input', async () => {
    const query = input.value.trim();
    results.innerHTML = '';

    if (!query) return;

    try {
      const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!data.length) {
        results.innerHTML = '<li>No results found.</li>';
        return;
      }

      data.forEach(post => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `/posts/${post.slug}`;
        a.textContent = post.title.rendered;
        li.appendChild(a);
        results.appendChild(li);
      });
    } catch (err) {
      console.error('Search error:', err);
      results.innerHTML = '<li>Error loading search results.</li>';
    }
  });
});
