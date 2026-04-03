const MOBILE_AGENTS = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];

export function isDesktopDevice(userAgent = '') {
  return !MOBILE_AGENTS.some(agent => userAgent.includes(agent));
}
