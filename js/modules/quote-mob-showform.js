export function initQuoteMobShowform() {
  const form  = document.getElementById('quote-form-section');
  const open  = document.getElementById('quote-mob-form-toggle-open-btn');
  const close = document.getElementById('quote-mob-form-toggle-close-btn');

  if (!form || !open || !close) return;

  function showForm() {
    form.style.display = 'block';
    open.style.display = 'none';
    close.style.display = 'inline-block';

    open.setAttribute('aria-expanded', 'true');

    const firstField = form.querySelector('input, select, textarea, button');
    if (firstField) firstField.focus();
  }

  function hideForm() {
    form.style.display = 'none';
    open.style.display = 'inline-block';
    close.style.display = 'none';

    open.setAttribute('aria-expanded', 'false');

    open.focus();
  }

  // Open → show
  open.addEventListener('click', showForm);

  // Close → hide
  close.addEventListener('click', hideForm);
}
