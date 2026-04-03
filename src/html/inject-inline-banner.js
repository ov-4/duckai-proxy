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
  --site-inline-banner-overlay: rgba(17, 17, 17, 0.72);
  --site-inline-banner-surface: #f7f7f8;
  --site-inline-banner-border: rgba(17, 17, 17, 0.08);
  --site-inline-banner-divider: rgba(17, 17, 17, 0.08);
  --site-inline-banner-title: #24252c;
  --site-inline-banner-text: #2f3137;
  --site-inline-banner-subtle: #6d7078;
  --site-inline-banner-link: #4067e8;
  --site-inline-banner-button: #4368e7;
  --site-inline-banner-button-hover: #3d61dc;
  --site-inline-banner-button-text: #ffffff;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background-color: var(--site-inline-banner-overlay);
}

html[data-theme="dark"] #site-inline-banner-root {
  --site-inline-banner-overlay: rgba(0, 0, 0, 0.78);
  --site-inline-banner-surface: #242424;
  --site-inline-banner-border: rgba(255, 255, 255, 0.08);
  --site-inline-banner-divider: rgba(255, 255, 255, 0.12);
  --site-inline-banner-title: #f5f5f6;
  --site-inline-banner-text: #f0f0f1;
  --site-inline-banner-subtle: #b8bac0;
  --site-inline-banner-link: #86a0ff;
  --site-inline-banner-button: #6f8ef0;
  --site-inline-banner-button-hover: #6485ea;
  --site-inline-banner-button-text: #1e2333;
}

#site-inline-banner-modal {
  width: min(92vw, 820px);
  max-height: min(92vh, 1100px);
  border: 1px solid var(--site-inline-banner-border);
  border-radius: 34px;
  background-color: var(--site-inline-banner-surface);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

#site-inline-banner-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 38px;
  padding: 58px 46px 42px;
}

#site-inline-banner-title {
  margin: 0;
  color: var(--site-inline-banner-title);
  font-size: clamp(32px, 4vw, 52px);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.04em;
  text-align: center;
}

#site-inline-banner-footer {
  border-top: 1px solid var(--site-inline-banner-divider);
  padding: 26px 46px 30px;
}

#site-inline-banner-legal {
  margin: 0;
  color: var(--site-inline-banner-text);
  font-size: clamp(15px, 2.1vw, 22px);
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
  margin-top: 28px;
}

#site-inline-banner-confirm {
  width: 100%;
  min-height: 72px;
  padding: 0 28px;
  border: 0;
  border-radius: 22px;
  background-color: var(--site-inline-banner-button);
  color: var(--site-inline-banner-button-text);
  font: inherit;
  font-size: clamp(20px, 2vw, 26px);
  font-weight: 700;
  letter-spacing: -0.02em;
  cursor: pointer;
}

#site-inline-banner-confirm:hover {
  background-color: var(--site-inline-banner-button-hover);
}

.site-inline-banner-section {
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
}

.site-inline-banner-icon {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.site-inline-banner-icon svg {
  width: 100%;
  height: 100%;
}

.site-inline-banner-copy {
  margin: 0;
  color: var(--site-inline-banner-text);
  font-size: clamp(20px, 2.2vw, 33px);
  line-height: 1.35;
  font-weight: 650;
  letter-spacing: -0.03em;
  text-align: center;
}

.site-inline-banner-copy-strong {
  margin: 0 0 10px;
  color: var(--site-inline-banner-text);
  font-size: clamp(22px, 2.2vw, 34px);
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.03em;
}

#site-inline-banner-models {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 24px;
  color: var(--site-inline-banner-subtle);
  font-size: clamp(18px, 2vw, 28px);
  line-height: 1.25;
  font-weight: 650;
  letter-spacing: -0.03em;
}

#site-inline-banner-models span {
  display: inline-flex;
  align-items: center;
}

@media (max-width: 590px) {
  #site-inline-banner-root {
    padding: 16px;
  }

  #site-inline-banner-modal {
    width: 100%;
    max-height: calc(100dvh - 32px);
    border-radius: 28px;
  }

  #site-inline-banner-main {
    gap: 28px;
    padding: 38px 24px 30px;
  }

  #site-inline-banner-footer {
    padding: 22px 24px 24px;
  }

  .site-inline-banner-icon {
    width: 72px;
    height: 72px;
  }

  #site-inline-banner-confirm {
    min-height: 58px;
    border-radius: 18px;
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
