import { injectScriptTag } from './inject-script-tag.js';

const SCRIPT_ID = 'site-inline-banner-script';

export function injectInlineBanner(text, config) {
  const scriptTag = renderInlineBannerScript(config);
  if (!scriptTag) {
    return text;
  }

  return injectScriptTag(text, scriptTag, SCRIPT_ID, 'body-start');
}

function renderInlineBannerScript(config) {
  const bannerHtml = String(config.bannerHtml || '').trim();
  if (!bannerHtml) {
    return '';
  }

  const cookieName = JSON.stringify(config.bannerCookieName || 'banner_closed');
  const cookieMaxAge = JSON.stringify(config.bannerCookieMaxAge || 60 * 60 * 24 * 365);
  const storageKey = JSON.stringify('site_inline_banner_closed');
  const modalMarkup = JSON.stringify(bannerHtml);
const styleCss = JSON.stringify(`
#site-inline-banner-root {
  --site-inline-banner-overlay: var(--sds-color-background-backdrop, hsla(0, 0%, 82%, 0.6));
  --site-inline-banner-surface: var(--sds-color-background-container-01, #ffffff);
  --site-inline-banner-border: var(--sds-color-border-01, rgba(0, 0, 0, 0.12));
  --site-inline-banner-divider: var(--sds-color-border-inner-divider, rgba(0, 0, 0, 0.12));
  --site-inline-banner-title: var(--sds-color-text-01, #222222);
  --site-inline-banner-text: var(--sds-color-text-01, #222222);
  --site-inline-banner-subtle: var(--sds-color-text-03, #666666);
  --site-inline-banner-link: var(--sds-color-text-accent-01, #3969ef);
  --site-inline-banner-button: var(--sds-color-background-accent-01, #3969ef);
  --site-inline-banner-button-hover: var(--sds-color-background-accent-01, #3969ef);
  --site-inline-banner-button-text: var(--sds-color-text-on-color, #ffffff);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: transparent;
  animation: site-inline-banner-backdrop-in 0.15s ease-in forwards;
}

#site-inline-banner-modal {
  width: min(80vw, 410px);
  max-width: min(80vw, 410px);
  max-height: 90vh;
  max-height: 90dvh;
  border: 1px solid var(--site-inline-banner-border);
  border-radius: 16px;
  background-color: var(--site-inline-banner-surface);
  box-shadow: 0 20px 40px 0 var(--sds-color-palette-shade-09, rgba(0, 0, 0, 0.09)), 0 4px 12px 0 var(--sds-color-palette-shade-01, rgba(0, 0, 0, 0.04));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  opacity: 0;
  transform: scale(0.8);
  animation: site-inline-banner-modal-in 0.125s ease-in-out forwards;
}

#site-inline-banner-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 20px 12px;
}

#site-inline-banner-title {
  margin: 0;
  color: var(--site-inline-banner-title);
  font-family: var(--ducksans-display-font-family, var(--default-font, sans-serif));
  font-size: 27px;
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: var(--ducksans-display-letter-spacing, -0.2px);
  text-align: center;
}

#site-inline-banner-footer {
  border-top: 1px solid var(--site-inline-banner-divider);
  padding: 16px 20px 20px;
  background-color: var(--site-inline-banner-surface);
}

#site-inline-banner-legal {
  margin: 0;
  color: var(--site-inline-banner-subtle);
  font-size: 14px;
  line-height: 1.45;
  text-align: center;
}

#site-inline-banner-legal a {
  color: var(--site-inline-banner-link);
  text-decoration: none;
}

#site-inline-banner-legal a:hover,
#site-inline-banner-legal a:focus-visible {
  text-decoration: underline;
}

#site-inline-banner-actions {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

#site-inline-banner-confirm {
  width: 100%;
  min-height: 48px;
  padding: 0 24px;
  border: 0;
  border-radius: 16px;
  background-color: var(--site-inline-banner-button);
  color: var(--site-inline-banner-button-text);
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: var(--ducksans-product-letter-spacing, 0.005em);
  cursor: pointer;
}

#site-inline-banner-confirm:hover {
  opacity: 0.9;
}

.site-inline-banner-section {
  width: 100%;
  max-width: 370px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.site-inline-banner-copy {
  margin: 0;
  color: var(--site-inline-banner-text);
  font-size: 16px;
  line-height: 1.45;
  font-weight: 600;
  letter-spacing: var(--ducksans-product-letter-spacing, 0.005em);
  text-align: center;
}

.site-inline-banner-copy-strong {
  margin: 0 0 6px;
  color: var(--site-inline-banner-text);
  font-size: 18px;
  line-height: 1.28;
  font-weight: 700;
  letter-spacing: var(--ducksans-product-letter-spacing, 0.005em);
}

#site-inline-banner-models {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 10px;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 600;
  letter-spacing: var(--ducksans-product-letter-spacing, 0.005em);
}

#site-inline-banner-link {
  color: inherit;
  text-decoration: none;
  font: inherit;
}

#site-inline-banner-link:hover,
#site-inline-banner-link:focus-visible {
  color: var(--site-inline-banner-link);
  text-decoration: underline;
}

@keyframes site-inline-banner-backdrop-in {
  to {
    background-color: var(--site-inline-banner-overlay);
  }
}

@keyframes site-inline-banner-modal-in {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 590px) {
  #site-inline-banner-root {
    padding: 16px;
  }

  #site-inline-banner-modal {
    width: 100%;
    max-width: 100%;
    max-height: calc(100dvh - 32px);
    border-radius: 16px;
  }

  #site-inline-banner-main {
    gap: 12px;
    padding: 24px 20px 12px;
  }

  #site-inline-banner-footer {
    padding: 16px 20px 20px;
  }

  #site-inline-banner-confirm {
    min-height: 48px;
    border-radius: 16px;
  }
}
`);

  return `
<script id="${SCRIPT_ID}">
  (function () {
    var cookieName = ${cookieName};
    var cookieMaxAge = ${cookieMaxAge};
    var storageKey = ${storageKey};
    var modalMarkup = ${modalMarkup};
    var styleCss = ${styleCss};
    var rootId = 'site-inline-banner-root';
    var modalId = 'site-inline-banner-modal';
    var confirmId = 'site-inline-banner-confirm';
    var styleId = 'site-inline-banner-style';

    function hasClosedBanner() {
      try {
        if (window.localStorage.getItem(storageKey) === '1') {
          return true;
        }
      } catch (error) {}

      var cookiePattern = new RegExp('(?:^|;\\\\s*)' + escapeRegExp(cookieName) + '=1(?:;|$)');
      return cookiePattern.test(document.cookie || '');
    }

    function escapeRegExp(value) {
      return String(value).replace(/[\\\\^$.*+?()[\]{}|]/g, '\\\\$&');
    }

    function ensureStyle() {
      if (document.getElementById(styleId)) {
        return;
      }

      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = styleCss;
      (document.head || document.documentElement).appendChild(style);
    }

    function closeBanner() {
      document.cookie = cookieName + '=1; path=/; max-age=' + cookieMaxAge + '; SameSite=Lax; Secure';
      try {
        window.localStorage.setItem(storageKey, '1');
      } catch (error) {}

      var root = document.getElementById(rootId);
      if (root) {
        root.remove();
      }
    }

    function buildModal() {
      if (!document.body || document.getElementById(rootId)) {
        return;
      }

      var template = document.createElement('template');
      template.innerHTML = modalMarkup;

      var root = template.content.firstElementChild;
      if (!root || root.id !== rootId) {
        return;
      }

      var modal = root.querySelector('#' + modalId);
      var confirmButton = root.querySelector('#' + confirmId);
      if (!modal || !confirmButton) {
        return;
      }

      confirmButton.addEventListener('click', closeBanner);
      document.body.appendChild(root);
      confirmButton.focus();
    }

    function mountInlineBanner() {
      if (hasClosedBanner()) {
        return;
      }

      ensureStyle();
      buildModal();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountInlineBanner, { once: true });
    } else {
      mountInlineBanner();
    }
  })();
</script>`;
}
