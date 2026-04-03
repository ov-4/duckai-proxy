export function buildRequestHeaders(request, upstreamDomain) {
  const headers = new Headers(request.headers);
  const requestOrigin = new URL(request.url).origin;
  const upstreamOrigin = `https://${upstreamDomain}`;

  try {
    headers.set('Host', upstreamDomain);
  } catch {
    // Some runtimes manage Host automatically for outgoing fetch requests.
  }

  headers.set('Origin', upstreamOrigin);
  headers.set('Referer', `${upstreamOrigin}/`);
  headers.set('Sec-Fetch-Site', 'same-origin');
  headers.delete('Content-Length');

  normalizeVqdHeader(headers, requestOrigin, upstreamOrigin);

  return headers;
}

export function rewriteUpstreamResponseHeaders(headers, upstreamDomain, hostName) {
  rewriteLocationHeader(headers, upstreamDomain, hostName);
  rewriteSetCookieHeaders(headers, upstreamDomain, hostName);
}

export function buildCorsHeaders(request) {
  const headers = new Headers();
  applyCorsHeaders(headers, request);
  return headers;
}

export function applyCorsHeaders(headers, request) {
  const requestOrigin = request.headers.get('Origin');

  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Headers', request.headers.get('Access-Control-Request-Headers') || '*');
  headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Origin', requestOrigin || '*');
  headers.append('Vary', 'Origin');
}

function normalizeVqdHeader(headers, requestOrigin, upstreamOrigin) {
  const vqdHeader = headers.get('X-Vqd-Hash-1');
  if (!vqdHeader) {
    return;
  }

  try {
    const decoded = JSON.parse(atob(vqdHeader));

    if (decoded.meta && typeof decoded.meta === 'object') {
      if (typeof decoded.meta.origin === 'string') {
        decoded.meta.origin = upstreamOrigin;
      }

      if (typeof decoded.meta.stack === 'string') {
        decoded.meta.stack = decoded.meta.stack.replaceAll(requestOrigin, upstreamOrigin);
      }
    }

    headers.set('X-Vqd-Hash-1', btoa(JSON.stringify(decoded)));
  } catch {
    // Ignore malformed client headers and forward the original value.
  }
}

function rewriteLocationHeader(headers, upstreamDomain, hostName) {
  const location = headers.get('location');
  if (!location) {
    return;
  }

  try {
    const parsed = new URL(location, `https://${upstreamDomain}`);
    if (parsed.host !== upstreamDomain) {
      return;
    }

    parsed.host = hostName;
    headers.set('location', parsed.toString());
  } catch {
    const upstreamPrefix = `https://${upstreamDomain}`;
    if (location.startsWith(upstreamPrefix)) {
      headers.set('location', `https://${hostName}${location.slice(upstreamPrefix.length)}`);
    }
  }
}

function rewriteSetCookieHeaders(headers, upstreamDomain, hostName) {
  const setCookies = getSetCookieValues(headers);
  if (setCookies.length === 0) {
    return;
  }

  headers.delete('set-cookie');

  for (const setCookie of setCookies) {
    headers.append('Set-Cookie', rewriteSetCookieDomain(setCookie, upstreamDomain, hostName));
  }
}

function getSetCookieValues(headers) {
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie();
  }

  if (typeof headers.getAll === 'function') {
    try {
      return headers.getAll('Set-Cookie');
    } catch {
      // Fall through to the combined-header parser below.
    }
  }

  const combinedHeader = headers.get('set-cookie');
  if (!combinedHeader) {
    return [];
  }

  return splitSetCookieHeader(combinedHeader);
}

function rewriteSetCookieDomain(setCookie, upstreamDomain, hostName) {
  return setCookie.replace(
    new RegExp(`(;\\s*Domain=)\\.?${escapeRegExp(upstreamDomain)}(?=;|$)`, 'i'),
    `$1${hostName}`
  );
}

function splitSetCookieHeader(headerValue) {
  const cookies = [];
  let start = 0;
  let inExpires = false;

  for (let index = 0; index < headerValue.length; index += 1) {
    const remaining = headerValue.slice(index).toLowerCase();

    if (!inExpires && remaining.startsWith('expires=')) {
      inExpires = true;
      index += 'expires='.length - 1;
      continue;
    }

    if (inExpires && headerValue[index] === ';') {
      inExpires = false;
      continue;
    }

    if (!inExpires && headerValue[index] === ',') {
      const remainder = headerValue.slice(index + 1);
      if (/^\s*[^=;\s]+=/u.test(remainder)) {
        cookies.push(headerValue.slice(start, index).trim());
        start = index + 1;
      }
    }
  }

  cookies.push(headerValue.slice(start).trim());
  return cookies.filter(Boolean);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
