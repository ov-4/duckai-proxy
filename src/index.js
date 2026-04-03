import { config } from './config.js';
import { isDesktopDevice } from './device.js';
import { applyCorsHeaders, buildCorsHeaders, buildRequestHeaders } from './headers.js';
import { replaceResponseText } from './html.js';

export default {
  async fetch(request) {
    return fetchAndApply(request);
  }
};

async function fetchAndApply(request) {
  const region = (request.headers.get('cf-ipcountry') || '').toUpperCase();
  const ipAddress = request.headers.get('cf-connecting-ip') || '';
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const originalHost = url.host;

  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    return Response.redirect(url.href);
  }

  url.searchParams.delete(config.rawModeParam);

  const upstreamDomain = isDesktopDevice(userAgent) ? config.upstream : config.upstreamMobile;
  url.host = upstreamDomain;
  url.protocol = 'https:';

  if (config.blockedRegions.includes(region)) {
    return new Response('Access denied: WorkersProxy is not available in your region yet.', {
      status: 403
    });
  }

  if (config.blockedIpAddresses.includes(ipAddress)) {
    return new Response('Access denied: Your IP address is blocked by WorkersProxy.', {
      status: 403
    });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: buildCorsHeaders(request)
    });
  }

  const upstreamResponse = await fetch(url.href, {
    method: request.method,
    headers: buildRequestHeaders(request, upstreamDomain),
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual'
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  applyCorsHeaders(responseHeaders, request);
  responseHeaders.delete('content-security-policy');
  responseHeaders.delete('content-security-policy-report-only');
  responseHeaders.delete('clear-site-data');
  responseHeaders.delete('x-frame-options');

  const contentType = responseHeaders.get('content-type');
  const isHtml = contentType && contentType.toLowerCase().includes('text/html');
  const body = isHtml
    ? await replaceResponseText(upstreamResponse.clone(), upstreamDomain, originalHost, request, config)
    : upstreamResponse.body;

  return new Response(body, {
    status: upstreamResponse.status,
    headers: responseHeaders
  });
}
