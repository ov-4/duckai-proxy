import { injectInlineBanner } from './html/inject-inline-banner.js';
import { injectLocalStorageDefaults } from './html/inject-local-storage-defaults.js';

export async function replaceResponseText(response, upstreamDomain, hostName, request, config) {
  let text = await response.text();

  for (const [sourceKey, targetKey] of Object.entries(config.replaceMap)) {
    const source = resolveReplacementValue(sourceKey, upstreamDomain, hostName);
    const target = resolveReplacementValue(targetKey, upstreamDomain, hostName);
    text = text.replace(new RegExp(source, 'g'), target);
  }

  text = maybeInjectLocalStorageDefaults(text, config);

  if (!config.enableBanner) {
    return text;
  }

  if (!hasClosedBanner(request, config.bannerCookieName)) {
    return injectInlineBanner(text, config);
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

function maybeInjectLocalStorageDefaults(text, config) {
  if (!config.enableLocalStorageDefaults) {
    return text;
  }

  return injectLocalStorageDefaults(text, config.localStorageDefaults);
}
