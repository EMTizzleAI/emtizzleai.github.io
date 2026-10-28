/* Smart Greetings installer: a friendly entry point to browser-native PWA installation.
   Installability and prompts vary by browser; never simulate a successful install. */
(() => {
  'use strict';
  let pendingInstall = null;
  const buttons = [...document.querySelectorAll('[data-pwa-install]')];
  const helpFields = [...document.querySelectorAll('[data-pwa-help]')];
  if (!buttons.length) return;

  const installed = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const tell = (message) => {
    for (const node of helpFields) {
      node.textContent = message;
      node.hidden = false;
    }
  };
  const instructions = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      return 'On iPhone or iPad: open this page in Safari, tap Share, then Add to Home Screen. Installation is free; member access is separate.';
    }
    if (/android/.test(ua)) {
      return 'On Android: open this page in Chrome, tap the three-dot menu (⋮), then Install app or Add to Home screen. Installation is free; member access is separate.';
    }
    return 'In Chrome or Edge, use the Install icon in the address bar or the browser menu. Installation is free; member access is separate.';
  };

  function markInstalled() {
    for (const button of buttons) {
      button.textContent = '✓ Smart Greetings installed';
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
    }
    tell('Smart Greetings is on your home screen! Your account and member access are managed separately.');
  }

  if (installed()) markInstalled();

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    pendingInstall = event;
  });

  window.addEventListener('appinstalled', () => {
    pendingInstall = null;
    markInstalled();
  });

  for (const button of buttons) {
    button.addEventListener('click', async () => {
      if (installed()) {
        markInstalled();
        return;
      }
      if (!pendingInstall) {
        tell(instructions());
        return;
      }

      const promptEvent = pendingInstall;
      pendingInstall = null;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === 'accepted') {
          tell('Installation accepted! Find Smart Greetings on your home screen. A customer account and active access are still required for protected features.');
        } else {
          tell(instructions());
        }
      } catch {
        tell(instructions());
      }
    });
  }

  // The network-only worker never caches private app HTML, sessions or payment status.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
})();
