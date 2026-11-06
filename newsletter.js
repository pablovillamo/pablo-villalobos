/* Public Brevo form. Subscription starts only after email confirmation. */
(() => {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  const status = document.getElementById('newsletter-status');
  const retry = document.getElementById('newsletter-retry');
  const button = form.querySelector('button[type="submit"]');
  let busy = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    if (form.elements.email_address_check.value) return;
    busy = true;
    button.disabled = true;
    button.textContent = 'Enviando…';
    status.textContent = '';
    retry.hidden = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(form.action + '?isAjax=1', {
        method: 'POST',
        body: new URLSearchParams({ EMAIL: form.elements.EMAIL.value.trim(), email_address_check: '', locale: 'es' }),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('subscription-unavailable');
      status.textContent = 'Revisá tu correo y confirmá la suscripción para recibir el boletín. Si no ves el mensaje, revisá spam o promociones.';
      form.reset();
    } catch {
      status.textContent = 'No pudimos confirmar la solicitud. Intentá de nuevo o abrí el formulario del boletín.';
      retry.hidden = false;
    } finally {
      clearTimeout(timeout);
      busy = false;
      button.disabled = false;
      button.textContent = 'Quiero recibir el boletín';
    }
  });
})();

