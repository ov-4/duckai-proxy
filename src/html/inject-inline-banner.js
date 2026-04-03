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
  const modalMarkup = JSON.stringify(bannerHtml);
  const styleCss = JSON.stringify(`
#site-inline-banner-root {
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: var(--sds-color-background-backdrop, rgba(17, 24, 39, 0.45));
}

#site-inline-banner-modal {
  width: min(90vw, 500px);
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  border: 1px solid var(--sds-color-border-01, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  background-color: var(--sds-color-background-container-01, #ffffff);
  color: var(--sds-color-text-01, #111111);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

#site-inline-banner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid var(--sds-color-border-inner-divider, rgba(0, 0, 0, 0.09));
}

#site-inline-banner-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 600;
}

#site-inline-banner-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 8px;
  border: 0;
  border-radius: 4px;
  background: none;
  color: var(--sds-color-text-02, rgba(0, 0, 0, 0.6));
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

#site-inline-banner-close:hover {
  background-color: var(--sds-color-background-utility, rgba(0, 0, 0, 0.06));
  color: var(--sds-color-text-01, #111111);
}

#site-inline-banner-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(80vh - 77px);
  padding: 20px;
  overflow: auto;
  color: var(--sds-color-text-03, rgba(0, 0, 0, 0.72));
  font-size: 14px;
  line-height: 1.5;
}

#site-inline-banner-body a {
  color: var(--sds-color-text-accent-01, #3969ef);
  text-decoration: none;
}

#site-inline-banner-body a:hover,
#site-inline-banner-body a:focus-visible {
  text-decoration: underline;
}

#site-inline-banner-body code {
  font-family: var(--sds-font-family-monospace, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 12px;
}

#site-inline-banner-actions {
  display: flex;
  justify-content: flex-end;
}

#site-inline-banner-confirm {
  min-width: 112px;
  min-height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background-color: var(--theme-col-bg-button-primary, #3969ef);
  color: var(--theme-col-txt-button-primary, #ffffff);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

#site-inline-banner-confirm:hover {
  background-color: var(--theme-col-bg-button-primary-hover, #2b55ca);
}

@media (max-width: 590px) {
  #site-inline-banner-root {
    padding: 16px;
  }

  #site-inline-banner-modal {
    width: 100%;
    max-height: calc(100vh - 32px);
    max-height: calc(100dvh - 32px);
  }

  #site-inline-banner-body {
    max-height: calc(100vh - 109px);
    max-height: calc(100dvh - 109px);
  }
}
`);

  return `
<script id="${SCRIPT_ID}">
  (function () {
    var cookieName = ${cookieName};
    var cookieMaxAge = ${cookieMaxAge};
    var modalMarkup = ${modalMarkup};
    var styleCss = ${styleCss};
    var rootId = 'site-inline-banner-root';
    var modalId = 'site-inline-banner-modal';
    var closeId = 'site-inline-banner-close';
    var confirmId = 'site-inline-banner-confirm';
    var styleId = 'site-inline-banner-style';

    function hasClosedBanner() {
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
      var closeButton = root.querySelector('#' + closeId);
      var confirmButton = root.querySelector('#' + confirmId);
      if (!modal || !closeButton || !confirmButton) {
        return;
      }

      closeButton.addEventListener('click', closeBanner);
      confirmButton.addEventListener('click', closeBanner);
      root.addEventListener('click', function (event) {
        if (event.target === root) {
          closeBanner();
        }
      });

      document.body.appendChild(root);
      closeButton.focus();
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
