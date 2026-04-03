import { isDesktopDevice } from './device.js';
import {
  applyCorsHeaders,
  buildCorsHeaders,
  buildRequestHeaders,
  rewriteUpstreamResponseHeaders
} from './headers.js';
import { replaceResponseText } from './html.js';

export async function handleRequest(request, config) {
  const region = getRegion(request);
  const ipAddress = getIpAddress(request);
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

  if (isBlockedValue(config.blockedRegions, region)) {
    return new Response('Access denied: WorkersProxy is not available in your region yet.', {
      status: 403
    });
  }

  if (isBlockedValue(config.blockedIpAddresses, ipAddress)) {
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
  rewriteUpstreamResponseHeaders(responseHeaders, upstreamDomain, originalHost);
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

function getRegion(request) {
  return (
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    ''
  ).toUpperCase();
}

function getIpAddress(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const forwardedIp = forwardedFor.split(',')[0]?.trim();
    if (forwardedIp) {
      return forwardedIp;
    }
  }

  return request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || '';
}

function isBlockedValue(blocklist = [], value = '') {
  if (!value) {
    return false;
  }

  return blocklist
    .map(entry => String(entry || '').trim())
    .filter(Boolean)
    .includes(value);
}
