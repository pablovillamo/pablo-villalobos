(() => {
  const measurementId = 'G-QGR71GN34Y';
  const preferenceKey = 'pv-analytics-consent-v1';
  const disabledKey = 'ga-disable-' + measurementId;
  let tagLoaded = false;
  let preference;

  try {
    preference = localStorage.getItem(preferenceKey);
  } catch {
    // The choice still applies to this page if storage is unavailable.
  }

  function startAnalytics() {
    window[disabledKey] = false;
    if (tagLoaded) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }

    tagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname,
      page_referrer: document.referrer ? new URL(document.referrer).origin : ''
    });

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(tag);
  }

  function savePreference(value) {
    preference = value;
    try {
      localStorage.setItem(preferenceKey, value);
    } catch {
      // Keep the choice for the current page.
    }

    if (value === 'accepted') {
      startAnalytics();
    } else {
      window[disabledKey] = true;
      if (tagLoaded) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
    }

    notice.hidden = true;
    preferences.hidden = false;
    preferences.focus();
  }

  const notice = document.createElement('section');
  notice.className = 'pv-analytics-notice';
  notice.setAttribute('aria-label', 'Preferencias de analítica');
  notice.innerHTML = '<p>Con su permiso, usamos Google Analytics para medir las visitas y mejorar el sitio. Puede cambiar su elección en cualquier momento.</p><div class="pv-analytics-actions"><button type="button">Rechazar</button><button type="button">Aceptar analítica</button></div>';
  const [reject, accept] = notice.querySelectorAll('button');
  reject.addEventListener('click', () => savePreference('rejected'));
  accept.addEventListener('click', () => savePreference('accepted'));

  const preferences = document.createElement('button');
  preferences.type = 'button';
  preferences.className = 'pv-analytics-preferences';
  preferences.textContent = 'Preferencias de analítica';
  preferences.addEventListener('click', () => {
    notice.hidden = false;
    preferences.hidden = true;
    reject.focus();
  });

  const hasPreference = preference === 'accepted' || preference === 'rejected';
  notice.hidden = hasPreference;
  preferences.hidden = !hasPreference;
  document.body.append(notice, preferences);

  if (preference === 'accepted') startAnalytics();
})();
