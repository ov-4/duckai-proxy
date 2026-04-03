import bannerHtml from './banner.html' with { type: 'text' };

export const config = {
  upstream: 'duck.ai', // destination

  upstreamMobile: 'duck.ai', // destination for mobile devices

  blockedRegions: [''], // ISO 3166-1 alpha-2, country code, only works on Cloudflare Workers
                        // eg. US, UK, JP

  blockedIpAddresses: [''],

  enableBanner: true, // pop-up

  enableLocalStorageDefaults: true, // Set local storage

  localStorageDefaults: {
    duckaiReasoningMode: '"reasoning"', // enale reasoning for gpt-5 mini
    duckaiReasoningUsed: 'true', // same
    duckaiHasAgreedToTerms: 'true' // disable duck.ai ToS pop-up
  },

  bannerHtml: bannerHtml,

  bannerCookieName: 'banner_closed',

  bannerCookieMaxAge: 60 * 60 * 24 * 365,

  replaceMap: {
    '$upstream': '$custom_domain',
    '//duck.ai': '' // Perhaps you have to replace here too
  }
};
