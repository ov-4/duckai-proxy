export async function replaceResponseText(response, upstreamDomain, hostName, request, config) {
  let text = await response.text();

  for (const [sourceKey, targetKey] of Object.entries(config.replaceMap)) {
    const source = resolveReplacementValue(sourceKey, upstreamDomain, hostName);
    const target = resolveReplacementValue(targetKey, upstreamDomain, hostName);
    text = text.replace(new RegExp(source, 'g'), target);
  }

  if (!hasClosedProjectBanner(request, config.projectBannerCookieName)) {
    text = injectProjectBanner(text, config);
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

function hasClosedProjectBanner(request, cookieName) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookiePattern = new RegExp(`(?:^|;\\s*)${cookieName}=1(?:;|$)`);
  return cookiePattern.test(cookieHeader);
}

function injectProjectBanner(text, config) {
  if (text.includes('id="duckai-project-banner"')) {
    return text;
  }

  const bannerMarkup = `
<style>
  #duckai-project-banner {
    position: sticky;
    top: 0;
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

  #duckai-project-banner a {
    color: #93c5fd;
    text-decoration: underline;
    word-break: break-all;
  }

  #duckai-project-banner button {
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
</style>
<div id="duckai-project-banner" role="banner">
  <span>项目地址：<a href="${config.projectUrl}" target="_blank" rel="noopener noreferrer">${config.projectUrl}</a></span>
  <button type="button" aria-label="关闭横幅">&times;</button>
</div>
<script>
  (function () {
    var banner = document.getElementById('duckai-project-banner');
    if (!banner) {
      return;
    }

    var closeButton = banner.querySelector('button');
    if (!closeButton) {
      return;
    }

    closeButton.addEventListener('click', function () {
      document.cookie = '${config.projectBannerCookieName}=1; path=/; max-age=${config.projectBannerCookieMaxAge}; SameSite=Lax; Secure';
      banner.remove();
    });
  })();
</script>`;

  if (/<body[^>]*>/i.test(text)) {
    return text.replace(/<body[^>]*>/i, match => `${match}${bannerMarkup}`);
  }

  if (/<html[^>]*>/i.test(text)) {
    return text.replace(/<html[^>]*>/i, match => `${match}${bannerMarkup}`);
  }

  return `${bannerMarkup}${text}`;
}
