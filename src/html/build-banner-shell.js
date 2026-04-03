import { renderLocalStorageDefaultsScript } from './inject-local-storage-defaults.js';

export function buildBannerShell(text, request, config, rawModeParam) {
  const iframeUrl = JSON.stringify(buildRawModeUrl(request.url, rawModeParam));
  const cookieName = JSON.stringify(config.bannerCookieName);
  const cookieMaxAge = JSON.stringify(config.bannerCookieMaxAge);
  const title = escapeHtml(extractTitle(text) || 'duck.ai');
  const localStorageDefaultsScript = config.enableLocalStorageDefaults
    ? renderLocalStorageDefaultsScript(config.localStorageDefaults)
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      background: #ffffff;
    }

    #site-banner {
      position: relative;
      z-index: 1;
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

    #site-frame {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
      background: #ffffff;
    }
  </style>
  ${localStorageDefaultsScript}
</head>
<body>
  <div id="site-banner" role="banner">
    ${config.bannerHtml || '<span></span>'}
    <button type="button" aria-label="关闭横幅">&times;</button>
  </div>
  <iframe id="site-frame" src=${iframeUrl} referrerpolicy="same-origin" allow="clipboard-read; clipboard-write"></iframe>
  <script>
    (function () {
      var body = document.body;
      var banner = document.getElementById('site-banner');
      var closeButton = document.querySelector('#site-banner button');
      if (!body || !banner || !closeButton) {
        return;
      }

      closeButton.addEventListener('click', function () {
        document.cookie = ${cookieName} + '=1; path=/; max-age=' + ${cookieMaxAge} + '; SameSite=Lax; Secure';
        banner.remove();
        body.style.gridTemplateRows = 'minmax(0, 1fr)';
      });
    })();
  </script>
</body>
</html>`;
}

function buildRawModeUrl(urlString, rawModeParam) {
  const url = new URL(urlString);
  url.searchParams.set(rawModeParam, '1');
  return url.toString();
}

function extractTitle(text) {
  const match = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : '';
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
