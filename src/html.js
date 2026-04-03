export async function replaceResponseText(response, upstreamDomain, hostName, request, config) {
  let text = await response.text();

  for (const [sourceKey, targetKey] of Object.entries(config.replaceMap)) {
    const source = resolveReplacementValue(sourceKey, upstreamDomain, hostName);
    const target = resolveReplacementValue(targetKey, upstreamDomain, hostName);
    text = text.replace(new RegExp(source, 'g'), target);
  }

  if (!hasClosedBanner(request, config.bannerCookieName)) {
    text = injectBanner(text, config);
  }

  return text;
}

function resolveReplacementValue(value, upstreamDomain, hostName) {
  if (value === '$upstream') {
    return upstreamDomain;
  }

  if (value === '$custom_domain') {
    return hostName;
  }

  return value;
}

function hasClosedBanner(request, cookieName) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookiePattern = new RegExp(`(?:^|;\\s*)${cookieName}=1(?:;|$)`);
  return cookiePattern.test(cookieHeader);
}

function injectBanner(text, config) {
  if (text.includes('id="site-banner"')) {
    return text;
  }

  const cookieName = JSON.stringify(config.bannerCookieName);
  const cookieMaxAge = JSON.stringify(config.bannerCookieMaxAge);
  const bannerMarkup = `
<style>
  html.site-banner-active {
    height: 100% !important;
    overflow: hidden !important;
  }

  body.site-banner-active {
    height: 100% !important;
    overflow: hidden !important;
  }

  #site-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 48px 12px 16px;
    background: #111827;
    color: #f9fafb;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }

  #site-banner a {
    color: #93c5fd;
    text-decoration: underline;
    word-break: break-all;
  }

  #site-banner button {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    padding: 4px;
  }

  #site-banner-page {
    position: fixed;
    top: var(--site-banner-height, 0px);
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
  }
</style>
<div id="site-banner" role="banner">
  ${config.bannerHtml || '<span></span>'}
  <button type="button" aria-label="关闭横幅">&times;</button>
</div>
<script>
  (function () {
    var html = document.documentElement;
    var body = document.body;
    var banner = document.getElementById('site-banner');
    if (!html || !body || !banner) {
      return;
    }

    var page = document.getElementById('site-banner-page');
    if (!page) {
      page = document.createElement('div');
      page.id = 'site-banner-page';
    }

    Array.from(body.childNodes).forEach(function (node) {
      if (node === banner || node === page || (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SCRIPT' && node === document.currentScript)) {
        return;
      }

      page.appendChild(node);
    });

    body.insertBefore(page, banner);
    html.classList.add('site-banner-active');
    body.classList.add('site-banner-active');

    var closeButton = banner.querySelector('button');
    var resizeObserver = null;

    function updateLayout() {
      html.style.setProperty('--site-banner-height', banner.offsetHeight + 'px');
    }

    updateLayout();
    window.addEventListener('resize', updateLayout);

    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(updateLayout);
      resizeObserver.observe(banner);
    }

    function teardown() {
      window.removeEventListener('resize', updateLayout);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      while (page.firstChild) {
        body.insertBefore(page.firstChild, page);
      }

      page.remove();
      html.classList.remove('site-banner-active');
      body.classList.remove('site-banner-active');
      html.style.removeProperty('--site-banner-height');
      banner.remove();
    }

    if (!closeButton) {
      return;
    }

    closeButton.addEventListener('click', function () {
      document.cookie = ${cookieName} + '=1; path=/; max-age=' + ${cookieMaxAge} + '; SameSite=Lax; Secure';
      teardown();
    });
  })();
</script>`;

  if (/<\/body>/i.test(text)) {
    return text.replace(/<\/body>/i, `${bannerMarkup}</body>`);
  }

  if (/<body[^>]*>/i.test(text)) {
    return text.replace(/<body[^>]*>/i, match => `${match}${bannerMarkup}`);
  }

  if (/<html[^>]*>/i.test(text)) {
    return text.replace(/<html[^>]*>/i, match => `${match}${bannerMarkup}`);
  }

  return `${bannerMarkup}${text}`;
}
