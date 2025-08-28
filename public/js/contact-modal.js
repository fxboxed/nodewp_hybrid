document.addEventListener('DOMContentLoaded', () => {
  const contactToggle = document.getElementById('contactToggle');
  const contactModal = document.getElementById('contactModal');
  const closeModal = document.getElementById('closeModal');
  const form = contactModal.querySelector('form');
  const formContainer = contactModal.querySelector('.modal-liner');

  contactToggle.addEventListener('click', () => {
    contactModal.classList.add('show');
  });

  closeModal.addEventListener('click', () => {
    contactModal.classList.remove('show');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const res = await fetch('/contact', {
        method: 'POST',
        body: new URLSearchParams(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        formContainer.innerHTML = `<p class="error-message">${data.message || 'Something went wrong.'}</p>`;
        return;
      }

      formContainer.innerHTML = `<p class="success-message">Thank you for contacting us!</p>`;
      setTimeout(() => {
        contactModal.classList.remove('show');
      }, 1500);
    } catch (err) {
      console.error('Fetch error:', err);
      formContainer.innerHTML = `<p class="error-message">Something went wrong. Please try again.</p>`;
    }
  });
});






