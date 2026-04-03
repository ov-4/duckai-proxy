export function buildRequestHeaders(request, upstreamDomain) {
  const headers = new Headers(request.headers);
  const requestOrigin = new URL(request.url).origin;
  const upstreamOrigin = `https://${upstreamDomain}`;

  headers.set('Host', upstreamDomain);
  headers.set('Origin', upstreamOrigin);
  headers.set('Referer', `${upstreamOrigin}/`);
  headers.set('Sec-Fetch-Site', 'same-origin');
  headers.delete('Content-Length');

  normalizeVqdHeader(headers, requestOrigin, upstreamOrigin);

  return headers;
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
