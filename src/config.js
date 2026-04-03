export const config = {
  upstream: 'duck.ai',
  upstreamMobile: 'duck.ai',
  blockedRegions: [''],
  blockedIpAddresses: ['127.0.0.1'],
  projectUrl: 'https://github.com/ov-4/duckai-proxy',
  projectBannerCookieName: 'duckai_proxy_banner_closed',
  projectBannerCookieMaxAge: 60 * 60 * 24 * 365,
  replaceMap: {
    '$upstream': '$custom_domain',
    '//duck.ai': ''
  }
};
