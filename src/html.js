export async function replaceResponseText(response, upstreamDomain, hostName, request, config) {
  let text = await response.text();

  for (const [sourceKey, targetKey] of Object.entries(config.replaceMap)) {
    const source = resolveReplacementValue(sourceKey, upstreamDomain, hostName);
    const target = resolveReplacementValue(targetKey, upstreamDomain, hostName);
    text = text.replace(new RegExp(source, 'g'), target);
  }

  const rawModeParam = config.rawModeParam || '__duckai_raw';
  if (isRawModeRequest(request, rawModeParam)) {
    return injectRawModePersistence(text, rawModeParam);
  }

  if (!hasClosedBanner(request, config.bannerCookieName)) {
    return buildBannerShell(text, request, config, rawModeParam);
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

function isRawModeRequest(request, rawModeParam) {
  const url = new URL(request.url);
  return url.searchParams.get(rawModeParam) === '1';
}

function buildBannerShell(text, request, config, rawModeParam) {
  const iframeUrl = JSON.stringify(buildRawModeUrl(request.url, rawModeParam));
  const cleanUrl = JSON.stringify(buildCleanUrl(request.url, rawModeParam));
  const cookieName = JSON.stringify(config.bannerCookieName);
  const cookieMaxAge = JSON.stringify(config.bannerCookieMaxAge);
  const title = escapeHtml(extractTitle(text) || 'duck.ai');

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
</head>
<body>
  <div id="site-banner" role="banner">
    ${config.bannerHtml || '<span></span>'}
    <button type="button" aria-label="关闭横幅">&times;</button>
  </div>
  <iframe id="site-frame" src=${iframeUrl} referrerpolicy="same-origin" allow="clipboard-read; clipboard-write"></iframe>
  <script>
    (function () {
      var closeButton = document.querySelector('#site-banner button');
      if (!closeButton) {
        return;
      }

      closeButton.addEventListener('click', function () {
        document.cookie = ${cookieName} + '=1; path=/; max-age=' + ${cookieMaxAge} + '; SameSite=Lax; Secure';
        window.location.replace(${cleanUrl});
      });
    })();
  </script>
</body>
</html>`;
}

function injectRawModePersistence(text, rawModeParam) {
  if (text.includes('id="site-raw-mode-script"')) {
    return text;
  }

  const rawModeScript = `
<script id="site-raw-mode-script">
  (function () {
    var rawModeParam = ${JSON.stringify(rawModeParam)};

    function toRawUrl(input) {
      var url = new URL(input, window.location.href);
      if (url.origin !== window.location.origin) {
        return url.toString();
      }

      url.searchParams.set(rawModeParam, '1');
      return url.toString();
    }

    var originalPushState = history.pushState;
    history.pushState = function (state, unused, url) {
      if (typeof url === 'string') {
        return originalPushState.call(history, state, unused, toRawUrl(url));
      }

      return originalPushState.call(history, state, unused, url);
    };

    var originalReplaceState = history.replaceState;
    history.replaceState = function (state, unused, url) {
      if (typeof url === 'string') {
        return originalReplaceState.call(history, state, unused, toRawUrl(url));
      }

      return originalReplaceState.call(history, state, unused, url);
    };

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') {
        return;
      }

      var link = target.closest('a[href]');
      if (!link) {
        return;
      }

      if (link.target && link.target !== '_self') {
        return;
      }

      try {
        link.href = toRawUrl(link.href);
      } catch (error) {}
    }, true);

    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (!form || !form.action) {
        return;
      }

      try {
        form.action = toRawUrl(form.action);
      } catch (error) {}
    }, true);

    if (window.location.search.indexOf(rawModeParam + '=1') === -1) {
      history.replaceState(history.state, '', toRawUrl(window.location.href));
    }
  })();
</script>`;

  if (/<\/body>/i.test(text)) {
    return text.replace(/<\/body>/i, `${rawModeScript}</body>`);
  }

  if (/<body[^>]*>/i.test(text)) {
    return text.replace(/<body[^>]*>/i, match => `${match}${rawModeScript}`);
  }

  if (/<\/html>/i.test(text)) {
    return text.replace(/<\/html>/i, `${rawModeScript}</html>`);
  }

  return `${text}${rawModeScript}`;
}

function buildRawModeUrl(urlString, rawModeParam) {
  const url = new URL(urlString);
  url.searchParams.set(rawModeParam, '1');
  return url.toString();
}

function buildCleanUrl(urlString, rawModeParam) {
  const url = new URL(urlString);
  url.searchParams.delete(rawModeParam);
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
