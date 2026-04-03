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
  width: min(90vw, 620px);
  max-height: min(90vh, 860px);
  border: 1px solid var(--site-inline-banner-border);
  border-radius: 28px;
  background-color: var(--site-inline-banner-surface);
  box-shadow: 0 18px 56px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

#site-inline-banner-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  padding: 34px 30px 28px;
}

#site-inline-banner-title {
  margin: 0;
  color: var(--site-inline-banner-title);
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.04em;
  text-align: center;
}

#site-inline-banner-footer {
  border-top: 1px solid var(--site-inline-banner-divider);
  padding: 18px 30px 24px;
}

#site-inline-banner-legal {
  margin: 0;
  color: var(--site-inline-banner-text);
  font-size: clamp(14px, 1.8vw, 17px);
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
  margin-top: 18px;
}

#site-inline-banner-confirm {
  width: 100%;
  min-height: 56px;
  padding: 0 24px;
  border: 0;
  border-radius: 18px;
  background-color: var(--site-inline-banner-button);
  color: var(--site-inline-banner-button-text);
  font: inherit;
  font-size: clamp(18px, 1.8vw, 22px);
  font-weight: 700;
  letter-spacing: -0.02em;
  cursor: pointer;
}

#site-inline-banner-confirm:hover {
  background-color: var(--site-inline-banner-button-hover);
}

.site-inline-banner-section {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.site-inline-banner-icon {
  width: 64px;
  height: 64px;
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
  font-size: clamp(16px, 1.8vw, 22px);
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: -0.03em;
  text-align: center;
}

.site-inline-banner-copy-strong {
  margin: 0 0 6px;
  color: var(--site-inline-banner-text);
  font-size: clamp(17px, 1.9vw, 24px);
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: -0.03em;
}

#site-inline-banner-models {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 14px;
  color: var(--site-inline-banner-subtle);
  font-size: clamp(14px, 1.7vw, 18px);
  line-height: 1.35;
  font-weight: 600;
  letter-spacing: -0.03em;
}

#site-inline-banner-models span {
  display: inline-flex;
  align-items: center;
}

#site-inline-banner-models code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.92em;
}

@media (max-width: 590px) {
  #site-inline-banner-root {
    padding: 16px;
  }

  #site-inline-banner-modal {
    width: 100%;
    max-height: calc(100dvh - 32px);
    border-radius: 24px;
  }

  #site-inline-banner-main {
    gap: 22px;
    padding: 28px 20px 22px;
  }

  #site-inline-banner-footer {
    padding: 16px 20px 20px;
  }

  .site-inline-banner-icon {
    width: 54px;
    height: 54px;
  }

  #site-inline-banner-confirm {
    min-height: 52px;
    border-radius: 16px;
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
