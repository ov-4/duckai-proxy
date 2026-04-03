import { buildBannerShell } from './html/build-banner-shell.js';
import { injectLocalStorageDefaults } from './html/inject-local-storage-defaults.js';
import { injectRawModePersistence } from './html/inject-raw-mode-persistence.js';

export async function replaceResponseText(response, upstreamDomain, hostName, request, config) {
  let text = await response.text();

  for (const [sourceKey, targetKey] of Object.entries(config.replaceMap)) {
    const source = resolveReplacementValue(sourceKey, upstreamDomain, hostName);
    const target = resolveReplacementValue(targetKey, upstreamDomain, hostName);
    text = text.replace(new RegExp(source, 'g'), target);
  }

  if (!config.enableBanner) {
    return text;
  }

  const rawModeParam = config.rawModeParam || '__duckai_raw';
  if (isRawModeRequest(request, rawModeParam)) {
    text = injectLocalStorageDefaults(text, config.localStorageDefaults);
    return injectRawModePersistence(text, rawModeParam);
  }

  if (!hasClosedBanner(request, config.bannerCookieName)) {
    return buildBannerShell(text, request, config, rawModeParam);
  }

  return injectLocalStorageDefaults(text, config.localStorageDefaults);
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
