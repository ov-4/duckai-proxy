import bannerHtml from './banner.html' with { type: 'text' };

export const config = {
  upstream: 'duck.ai',
  upstreamMobile: 'duck.ai',
  blockedRegions: [''],
  blockedIpAddresses: ['127.0.0.1'],
  localStorageDefaults: {
    duckaiReasoningMode: '"reasoning"',
    duckaiReasoningUsed: 'true',
    duckaiHasAgreedToTerms: 'true'
  },
  rawModeParam: '__duckai_raw',
  bannerHtml: bannerHtml,
  bannerCookieName: 'banner_closed',
  bannerCookieMaxAge: 60 * 60 * 24 * 365,
  replaceMap: {
    '$upstream': '$custom_domain',
    '//duck.ai': ''
  }
};
