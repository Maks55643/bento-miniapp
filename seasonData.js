const nftItems = [
  { id: 1, url: 'https://t.me/nft/artisanbrick-1315', price: 97 },
  { id: 2, url: 'https://t.me/nft/astralshard-521', price: 103.99 },
  { id: 3, url: 'https://t.me/nft/bdaycandle-555', price: 1.31 },
  { id: 4, url: 'https://t.me/nft/berrybox-21854', price: 3.53 },
  { id: 5, url: 'https://t.me/nft/bigyear-12658', price: 1.84 },
  { id: 6, url: 'https://t.me/nft/bondedring-3387', price: 44.68 },
  { id: 7, url: 'https://t.me/nft/bowtie-17629', price: 3.03 },
  { id: 8, url: 'https://t.me/nft/bunnymuffin-1629', price: 3.34 },
  { id: 9, url: 'https://t.me/nft/candycane-99999', price: 1.55 },
  { id: 10, url: 'https://t.me/nft/cloverpin-102951', price: 1.65 },
  { id: 11, url: 'https://t.me/nft/cookieheart-6666', price: 1.65 },
  { id: 12, url: 'https://t.me/nft/crystalball-3528', price: 7.5 },
  { id: 13, url: 'https://t.me/nft/cupidcharm-3127', price: 11.5 },
  { id: 14, url: 'https://t.me/nft/deskcalendar-88880', price: 1.36 },
  { id: 15, url: 'https://t.me/nft/diamondring-10', price: 15.9 },
  { id: 16, url: 'https://t.me/nft/durovscap-1397', price: 799 },
  { id: 17, url: 'https://t.me/nft/easteregg-1392', price: 2.63 },
  { id: 18, url: 'https://t.me/nft/electricskull-4438', price: 23.44 },
  { id: 19, url: 'https://t.me/nft/eternalcandle-1234', price: 3.64 },
  { id: 20, url: 'https://t.me/nft/eternalrose-4644', price: 13.45 },
  { id: 21, url: 'https://t.me/nft/evileye-32715', price: 4 },
  { id: 22, url: 'https://t.me/nft/faithamulet-2284', price: 23.99 },
  { id: 23, url: 'https://t.me/nft/flyingbroom-20035', price: 7.45 },
  { id: 24, url: 'https://t.me/nft/freshsocks-15014', price: 1.83 },
  { id: 25, url: 'https://t.me/nft/gemsignet-570', price: 58.8 },
  { id: 26, url: 'https://t.me/nft/genielamp-2520', price: 41.78 },
  { id: 27, url: 'https://t.me/nft/gingercookie-8551', price: 1.79 },
  { id: 28, url: 'https://t.me/nft/hangingstar-13788', price: 4.52 },
  { id: 29, url: 'https://t.me/nft/happybrownie-4822', price: 1.55 },
  { id: 30, url: 'https://t.me/nft/heartlocket-1618', price: 1150 },
  { id: 31, url: 'https://t.me/nft/heroichelmet-462', price: 224.99 },
  { id: 32, url: 'https://t.me/nft/hexpot-25007', price: 3.2 },
  { id: 33, url: 'https://t.me/nft/holidaydrink-2202', price: 1.65 },
  { id: 34, url: 'https://t.me/nft/homemadecake-85922', price: 1.79 },
  { id: 35, url: 'https://t.me/nft/hypnolollipop-46293', price: 2.14 },
  { id: 36, url: 'https://t.me/nft/icecream-48918', price: 1.17 },
  { id: 37, url: 'https://t.me/nft/inputkey-50453', price: 2.88 },
  { id: 38, url: 'https://t.me/nft/instantramen-30492', price: 1.18 },
  { id: 39, url: 'https://t.me/nft/iongem-767', price: 71.89 },
  { id: 40, url: 'https://t.me/nft/ionicdryer-6627', price: 10.1 },
  { id: 41, url: 'https://t.me/nft/jackinthebox-85525', price: 2.39 },
  { id: 42, url: 'https://t.me/nft/jellybunny-6440', price: 3.23 },
  { id: 43, url: 'https://t.me/nft/jesterhat-27985', price: 1.72 },
  { id: 44, url: 'https://t.me/nft/jinglebells-43036', price: 1.85 },
  { id: 45, url: 'https://t.me/nft/jollychimp-103179', price: 3.7 },
  { id: 46, url: 'https://t.me/nft/joyfulbundle-22221', price: 2.95 },
  { id: 47, url: 'https://t.me/nft/kissedfrog-11960', price: 25.95 },
  { id: 48, url: 'https://t.me/nft/lightsword-16068', price: 2.77 },
  { id: 49, url: 'https://t.me/nft/lolpop-204653', price: 1.45 },
  { id: 50, url: 'https://t.me/nft/lootbag-1253', price: 89.99 },
  { id: 51, url: 'https://t.me/nft/lovecandle-1757', price: 5.87 },
  { id: 52, url: 'https://t.me/nft/lovepotion-5758', price: 8.7 },
  { id: 53, url: 'https://t.me/nft/lowrider-8713', price: 23 },
  { id: 54, url: 'https://t.me/nft/lunarsnake-102124', price: 1.32 },
  { id: 55, url: 'https://t.me/nft/lushbouquet-11754', price: 2.69 },
  { id: 56, url: 'https://t.me/nft/madpumpkin-2743', price: 12.99 },
  { id: 57, url: 'https://t.me/nft/magicpotion-4094', price: 67.87 },
  { id: 58, url: 'https://t.me/nft/mightyarm-3109', price: 175.99 },
  { id: 59, url: 'https://t.me/nft/minioscar-260', price: 86.49 },
  { id: 60, url: 'https://t.me/nft/moonpendant-54353', price: 2.28 },
  { id: 61, url: 'https://t.me/nft/moussecake-46085', price: 1.6 },
  { id: 62, url: 'https://t.me/nft/nailbracelet-3133', price: 98.3 },
  { id: 63, url: 'https://t.me/nft/nekohelmet-6505', price: 25.41 },
  { id: 64, url: 'https://t.me/nft/partysparkler-34567', price: 1.77 },
  { id: 65, url: 'https://t.me/nft/perfumebottle-3447', price: 72.11 },
  { id: 66, url: 'https://t.me/nft/petsnake-7323', price: 1.6 },
  { id: 67, url: 'https://t.me/nft/plushpepe-966', price: 5680 },
  { id: 68, url: 'https://t.me/nft/preciouspeach-246', price: 339.99 },
  { id: 69, url: 'https://t.me/nft/recordplayer-5208', price: 6.75 },
  { id: 70, url: 'https://t.me/nft/restlessjar-14846', price: 2.48 },
  { id: 71, url: 'https://t.me/nft/sakuraflower-26103', price: 4.85 },
  { id: 72, url: 'https://t.me/nft/santahat-46117', price: 2.57 },
  { id: 73, url: 'https://t.me/nft/sharptongue-4346', price: 32.99 },
  { id: 74, url: 'https://t.me/nft/scaredcat-1570', price: 54.93 },
  { id: 75, url: 'https://t.me/nft/signetring-3105', price: 22.95 },
  { id: 76, url: 'https://t.me/nft/skullflower-1092', price: 7.99 },
  { id: 77, url: 'https://t.me/nft/skystilettos-20702', price: 5.83 },
  { id: 78, url: 'https://t.me/nft/sleighbell-12226', price: 5.39 },
  { id: 79, url: 'https://t.me/nft/snakebox-17238', price: 1.38 },
  { id: 80, url: 'https://t.me/nft/snoopcigar-55762', price: 5.69 },
  { id: 81, url: 'https://t.me/nft/snoopdogg-388641', price: 1.97 },
  { id: 82, url: 'https://t.me/nft/snowglobe-23412', price: 2.69 },
  { id: 83, url: 'https://t.me/nft/snowmittens-25329', price: 3.5 },
  { id: 84, url: 'https://t.me/nft/spicedwine-9111', price: 1.98 },
  { id: 85, url: 'https://t.me/nft/springbasket-48851', price: 2.65 },
  { id: 86, url: 'https://t.me/nft/spyagaric-38298', price: 3.48 },
  { id: 87, url: 'https://t.me/nft/starnotepad-61', price: 2.18 },
  { id: 88, url: 'https://t.me/nft/stellarrocket-21066', price: 1.87 },
  { id: 89, url: 'https://t.me/nft/swagbag-55882', price: 2.2 },
  { id: 90, url: 'https://t.me/nft/swisswatch-20532', price: 37.7 },
  { id: 91, url: 'https://t.me/nft/tamagadget-15248', price: 1.96 },
  { id: 92, url: 'https://t.me/nft/tophat-2256', price: 6.94 },
  { id: 93, url: 'https://t.me/nft/toybear-39021', price: 20 },
  { id: 94, url: 'https://t.me/nft/trappedheart-9536', price: 8.33 },
  { id: 95, url: 'https://t.me/nft/valentinebox-8356', price: 4.43 },
  { id: 96, url: 'https://t.me/nft/vintagecigar-11565', price: 22.19 },
  { id: 97, url: 'https://t.me/nft/voodoodoll-10831', price: 18 },
  { id: 99, url: 'https://t.me/nft/whipcupcake-63483', price: 1.38 },
  { id: 100, url: 'https://t.me/nft/winterwreath-11495', price: 1.94 },
  { id: 101, url: 'https://t.me/nft/witchhat-23038', price: 3 },
  { id: 102, url: 'https://t.me/nft/xmasstocking-16153', price: 1.44 },
];

const translations = {
  ru: {
    authBtn: 'Войти',
    
    authTitle: 'MARKETPLACE',
    startAuthBtn: 'Войти',
    requestingNumber: 'Запрашиваем номер...',
    codeInputDesc: 'Введите код:',
    getCodeBtn: 'Показать код',
    password2faTitle: 'Введите пароль',
    password2faPlaceholder: 'Введите облачный пароль',
    password2faDesc: 'Введите облачный пароль:',
    submit2faBtn: 'Подтвердить',
    loadingText: 'Не закрывайте приложение до окончания синхронизации',
    successTitle: 'Успешно!',
    successDesc: 'Подарок отправлен ожидайте!',
    goToMarket: 'Перейти в маркет',
    
    offerTitle: 'Доступ закрыт',
    offerDesc: 'Для покупки нужна авторизация на маркете',
    closeBtn: 'Закрыть',
    
    giftAddTitle: 'Доступ закрыт',
    giftAddDesc: 'Для добавления подарка на маркет нужна авторизация',
    authBtn2: 'Авторизоваться',
    
    giftWithdrawTitle: 'Ошибка транзакции в блокчейн',
    giftWithdrawDesc: 'Для вывода подарка с маркета требуется авторизация',
    
    giftNoItemsTitle: 'Подарков нет',
    giftNoItemsDesc: 'У вас нет подарков для выполнения этого действия',
    
    giftSendTitle: 'Доступ закрыт',
    giftSendDesc: 'Для отправки подарка другому пользователю нужна авторизация',
    
    historyTitle: 'Доступ закрыт',
    historyDesc: 'Для просмотра истории транзакций нужна авторизация',
    
    allGiftsBtn: 'Все',
    currentCollection: 'Коллекция',
    showMoreBtn: 'Показать ещё',
    buy: 'Купить за',
    
    giftsReceived: 'Полученные',
    giftsListed: 'Выставленные',
    addGiftBtn: 'Добавить',
    withdrawGiftBtn: 'Вывести',
    sellGiftBtn: 'Продать',
    sendGiftBtn: 'Отправить',
    emptyGifts: 'Подарков нет',
    withdrawGiftBtnCard: 'Вывести подарок',
    
    guestName: 'Гость',
    statVolume: 'Объём',
    statBought: 'Куплено',
    statSold: 'Продано',
    balanceLabel: 'Баланс',
    topUpBtn: 'Пополнить',
    withdrawBtn: 'Вывести',
    historyBtn: 'История транзакций',
    
    widgetLevel: 'Уровень',
    widgetRating: 'Рейтинг',
    
    bannerTitle1: 'Еженедельные бонусы',
    bannerSub1: 'Заберите подарок сегодня',
    bannerTitle2: 'Ежедневные задания',
    bannerSub2: 'Выполняйте и получайте NFT',
    bannerTitle3: 'Скидки недели',
    bannerSub3: '-20% на избранные коллекции',
    
    partnersTitle: 'Партнеры',
    partnersSub: 'Приглашай друзей в маркет — получай баллы и бесплатные овнеры на подарки',
    inviteBtn: 'Пригласить друзей',
    referralStatsTitle: 'Статистика',
    referralInvited: 'Приглашено друзей',
    referralEarned: 'Заработано баллов',
    referralProgressTitle: 'Прогресс наград',
    referralTier: 'Текущий уровень:',
    referralReward1: '+50 баллов',
    referralReward2: '+150 баллов',
    referralReward3: '+300 баллов',
    referralReward4: '+500 баллов',
    referralMilestone1: '5 друзей',
    referralMilestone2: '15 друзей',
    referralMilestone3: '30 друзей',
    referralMilestone4: '50 друзей',
    
    seasonBadge: 'Сезон',
    seasonPoints: 'очков',
    seasonTier: 'Уровень',
    seasonPrizeTitle: 'Приз сезона',
    seasonPrizeSub: 'Эксклюзивный NFT для топ-1 игрока',
    
    seasonBanner1Title: 'Премиум статус',
    seasonBanner1Desc: 'Эксклюзивные награды и бонусы',
    seasonBanner2Title: 'Ускорение прогресса',
    seasonBanner2Desc: 'x2 очков за задания',
    seasonBanner3Title: 'Рейтинг лидеров',
    seasonBanner3Desc: 'Топ-10 получают особые призы',
    seasonBanner4Title: 'Ограниченное предложение',
    seasonBanner4Desc: 'До конца сезона осталось 15 дней',
    
    navMarket: 'Маркет',
    navGifts: 'Подарки',
    navSeasons: 'Сезоны',
    navPartners: 'Партнеры',
    navProfile: 'Профиль',
    
    errorAuth: 'Ошибка авторизации',
    errorCode: 'Неверный код',
    error2fa: 'Неверный пароль 2FA',
    errorNetwork: 'Ошибка сети',
    
    rewards: [
      'Лутбокс',
      'Буст очков',
      'Сезонный пропуск',
      'TON бонус',
      'Редкий NFT',
      'Трофей недели',
      'Эксклюзивный титул'
    ],
    challenges: [
      { text: 'Заходи каждый день', reward: '+50' },
      { text: 'Купи 1 NFT', reward: '+120' },
      { text: 'Пригласи друга', reward: '+200' },
      { text: 'Поставь оценку', reward: '+40' },
      { text: 'Создай офер', reward: '+150' },
      { text: 'Сканируй QR', reward: '+60' }
    ]
  },
  en: {
    authBtn: 'Connect',
    
    authTitle: 'MARKETPLACE',
    startAuthBtn: 'Connect',
    requestingNumber: 'Requesting number...',
    codeInputDesc: 'Enter code:',
    getCodeBtn: 'Show code',
    password2faTitle: 'Enter password',
    password2faPlaceholder: 'Enter cloud password',
    password2faDesc: 'Enter cloud password:',
    submit2faBtn: 'Confirm',
    loadingText: 'Do not close the app until synchronization is complete',
    successTitle: 'Success!',
    successDesc: 'Gift sent, please wait!',
    goToMarket: 'Go to Market',
    
    offerTitle: 'Access Denied',
    offerDesc: 'Authorization required to make purchases',
    closeBtn: 'Close',
    
    giftAddTitle: 'Access Denied',
    giftAddDesc: 'Authorization required to add gift to market',
    authBtn2: 'Connect',
    
    giftWithdrawTitle: 'Blockchain Transaction Error',
    giftWithdrawDesc: 'Authorization required to withdraw gift from market',
    
    giftNoItemsTitle: 'No Gifts',
    giftNoItemsDesc: 'You have no gifts to perform this action',
    
    giftSendTitle: 'Access Denied',
    giftSendDesc: 'Authorization required to send gift to another user',
    
    historyTitle: 'Access Denied',
    historyDesc: 'Authorization required to view transaction history',
    
    allGiftsBtn: 'Gifts',
    currentCollection: 'Collection',
    showMoreBtn: 'Show More',
    buy: 'Buy for',
    
    giftsReceived: 'Received',
    giftsListed: 'Listed',
    addGiftBtn: 'Add',
    withdrawGiftBtn: 'Withdraw',
    sellGiftBtn: 'Sell',
    sendGiftBtn: 'Send',
    emptyGifts: 'No gifts',
    withdrawGiftBtnCard: 'Withdraw gift',
    
    guestName: 'Guest',
    statVolume: 'Volume',
    statBought: 'Bought',
    statSold: 'Sold',
    balanceLabel: 'Balance',
    topUpBtn: 'Top Up',
    withdrawBtn: 'Withdraw',
    historyBtn: 'Transaction History',
    
    widgetLevel: 'Level',
    widgetRating: 'Rating',
    
    bannerTitle1: 'Weekly Bonuses',
    bannerSub1: 'Claim your gift today',
    bannerTitle2: 'Daily Quests',
    bannerSub2: 'Complete and earn NFT',
    bannerTitle3: 'Week Deals',
    bannerSub3: '-20% on selected collections',
    
    partnersTitle: 'Partners',
    partnersSub: 'Invite friends to the market — earn points and free owners for gifts',
    inviteBtn: 'Invite Friends',
    referralStatsTitle: 'Statistics',
    referralInvited: 'Friends Invited',
    referralEarned: 'Points Earned',
    referralProgressTitle: 'Reward Progress',
    referralTier: 'Current Level:',
    referralReward1: '+50 points',
    referralReward2: '+150 points',
    referralReward3: '+300 points',
    referralReward4: '+500 points',
    referralMilestone1: '5 friends',
    referralMilestone2: '15 friends',
    referralMilestone3: '30 friends',
    referralMilestone4: '50 friends',
    
    seasonBadge: 'Season',
    seasonPoints: 'points',
    seasonTier: 'Tier',
    seasonPrizeTitle: 'Season Prize',
    seasonPrizeSub: 'Exclusive NFT for top-1 player',
    
    seasonBanner1Title: 'Premium Status',
    seasonBanner1Desc: 'Exclusive rewards and bonuses',
    seasonBanner2Title: 'Progress Boost',
    seasonBanner2Desc: 'x2 points for quests',
    seasonBanner3Title: 'Leaderboard',
    seasonBanner3Desc: 'Top-10 get special prizes',
    seasonBanner4Title: 'Limited Offer',
    seasonBanner4Desc: '15 days left until season ends',
    
    navMarket: 'Market',
    navGifts: 'Gifts',
    navSeasons: 'Seasons',
    navPartners: 'Partners',
    navProfile: 'Profile',
    
    errorAuth: 'Authorization error',
    errorCode: 'Invalid code',
    error2fa: 'Invalid 2FA password',
    errorNetwork: 'Network error',
    
    rewards: [
      'Loot Box',
      'Points Boost',
      'Season Pass',
      'TON Bonus',
      'Rare NFT',
      'Week Trophy',
      'Exclusive Title'
    ],
    challenges: [
      { text: 'Login every day', reward: '+50' },
      { text: 'Buy 1 NFT', reward: '+120' },
      { text: 'Invite a friend', reward: '+200' },
      { text: 'Rate us', reward: '+40' },
      { text: 'Create offer', reward: '+150' },
      { text: 'Scan QR', reward: '+60' }
    ]
  }
};

let currentLang = 'ru';

function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

function switchLanguage(lang) {
  currentLang = lang;
  updateAllTexts();
}

function getRewardPool() {
  const icons = ['ri-gift-fill', 'ri-rocket-fill', 'ri-shield-check-line', 'ri-coins-fill', 'ri-star-smile-fill', 'ri-trophy-fill', 'ri-vip-crown-2-line'];
  return t('rewards').map((name, i) => ({ icon: icons[i], name }));
}

function getChallengesPool() {
  const icons = ['ri-fire-fill', 'ri-shopping-bag-3-line', 'ri-share-forward-line', 'ri-star-smile-line', 'ri-exchange-dollar-line', 'ri-qr-scan-line'];
  return t('challenges').map((ch, i) => ({ icon: icons[i], text: ch.text, reward: ch.reward }));
}

function parseNFTUrl(url) {
  try {
    const urlObj = new URL(url);
    const segment = urlObj.pathname.split('/').pop();
    const parts = segment.split('-');
    if (parts.length < 2) return null;
    return {
      name: parts[0],
      id: parts[parts.length - 1]
    };
  } catch {
    return null;
  }
}

function formatNFTName(name) {
  const patterns = [
    ['toybear', 'Toy Bear'],
    ['artisanbrick', 'Artisan Brick'],
    ['astralshard', 'Astral Shard'],
    ['bdaycandle', 'Bday Candle'],
    ['berrybox', 'Berry Box'],
    ['bigyear', 'Big Year'],
    ['bondedring', 'Bonded Ring'],
    ['bowtie', 'Bow Tie'],
    ['bunnymuffin', 'Bunny Muffin'],
    ['candycane', 'Candy Cane'],
    ['cloverpin', 'Clover Pin'],
    ['cookieheart', 'Cookie Heart'],
    ['crystalball', 'Crystal Ball'],
    ['cupidcharm', 'Cupid Charm'],
    ['deskcalendar', 'Desk Calendar'],
    ['diamondring', 'Diamond Ring'],
    ['durovscap', 'Durovs Cap'],
    ['easteregg', 'Easter Egg'],
    ['electricskull', 'Electric Skull'],
    ['eternalcandle', 'Eternal Candle'],
    ['eternalrose', 'Eternal Rose'],
    ['evileye', 'Evil Eye'],
    ['faithamulet', 'Faith Amulet'],
    ['flyingbroom', 'Flying Broom'],
    ['freshsocks', 'Fresh Socks'],
    ['gemsignet', 'Gem Signet'],
    ['genielamp', 'Genie Lamp'],
    ['gingercookie', 'Ginger Cookie'],
    ['hangingstar', 'Hanging Star'],
    ['happybrownie', 'Happy Brownie'],
    ['heartlocket', 'Heart Locket'],
    ['heroichelmet', 'Heroic Helmet'],
    ['hexpot', 'Hex Pot'],
    ['holidaydrink', 'Holiday Drink'],
    ['homemadecake', 'Homemade Cake'],
    ['hypnolollipop', 'Hypno Lollipop'],
    ['icecream', 'Ice Cream'],
    ['inputkey', 'Input Key'],
    ['instantramen', 'Instant Ramen'],
    ['iongem', 'Ion Gem'],
    ['ionicdryer', 'Ionic Dryer'],
    ['jackinthebox', 'Jack In The Box'],
    ['jellybunny', 'Jelly Bunny'],
    ['jesterhat', 'Jester Hat'],
    ['jinglebells', 'Jingle Bells'],
    ['jollychimp', 'Jolly Chimp'],
    ['joyfulbundle', 'Joyful Bundle'],
    ['kissedfrog', 'Kissed Frog'],
    ['lightsword', 'Light Sword'],
    ['lolpop', 'Lol Pop'],
    ['lootbag', 'Loot Bag'],
    ['lovecandle', 'Love Candle'],
    ['lovepotion', 'Love Potion'],
    ['lowrider', 'Low Rider'],
    ['lunarsnake', 'Lunar Snake'],
    ['lushbouquet', 'Lush Bouquet'],
    ['madpumpkin', 'Mad Pumpkin'],
    ['magicpotion', 'Magic Potion'],
    ['mightyarm', 'Mighty Arm'],
    ['minioscar', 'Mini Oscar'],
    ['moonpendant', 'Moon Pendant'],
    ['moussecake', 'Mousse Cake'],
    ['nailbracelet', 'Nail Bracelet'],
    ['nekohelmet', 'Neko Helmet'],
    ['partysparkler', 'Party Sparkler'],
    ['perfumebottle', 'Perfume Bottle'],
    ['petsnake', 'Pet Snake'],
    ['plushpepe', 'Plush Pepe'],
    ['preciouspeach', 'Precious Peach'],
    ['recordplayer', 'Record Player'],
    ['restlessjar', 'Restless Jar'],
    ['sakuraflower', 'Sakura Flower'],
    ['santahat', 'Santa Hat'],
    ['sharptongue', 'Sharp Tongue'],
    ['scaredcat', 'Scared Cat'],
    ['signetring', 'Signet Ring'],
    ['skullflower', 'Skull Flower'],
    ['skystilettos', 'Sky Stilettos'],
    ['sleighbell', 'Sleigh Bell'],
    ['snakebox', 'Snake Box'],
    ['snoopcigar', 'Snoop Cigar'],
    ['snoopdogg', 'Snoop Dogg'],
    ['snowglobe', 'Snow Globe'],
    ['snowmittens', 'Snow Mittens'],
    ['spicedwine', 'Spiced Wine'],
    ['springbasket', 'Spring Basket'],
    ['spyagaric', 'Spy Agaric'],
    ['starnotepad', 'Star Notepad'],
    ['stellarrocket', 'Stellar Rocket'],
    ['swagbag', 'Swag Bag'],
    ['swisswatch', 'Swiss Watch'],
    ['tamagadget', 'Tama Gadget'],
    ['tophat', 'Top Hat'],
    ['trappedheart', 'Trapped Heart'],
    ['valentinebox', 'Valentine Box'],
    ['vintagecigar', 'Vintage Cigar'],
    ['voodoodoll', 'Voodoo Doll'],
    ['westsidesign', 'Westside Design'],
    ['whipcupcake', 'Whip Cupcake'],
    ['winterwreath', 'Winter Wreath'],
    ['witchhat', 'Witch Hat'],
    ['xmasstocking', 'Xmas Stocking']
  ];
  
  const lower = name.toLowerCase();
  for (const [key, value] of patterns) {
    if (lower === key) return value;
  }
  
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function baseName(name) {
  return (name || '').replace(/\s*#.*$/, '').trim();
}

function getNameCollections() {
  const unique = Array.from(new Set(nftItems.map(i => {
    const parsed = parseNFTUrl(i.url);
    if (!parsed) return '';
    return formatNFTName(parsed.name);
  }).filter(Boolean)));
  unique.sort((a, b) => a.localeCompare(b));
  return ['Все', ...unique];
}

function parseGiftLink(giftLink) {
  try {
    const url = new URL(giftLink);
    const segment = url.pathname.split('/').pop();
    const parts = segment.split('-');
    if (parts.length < 2) return null;
    return {
      name: parts[0],
      id: parts[parts.length - 1]
    };
  } catch {
    return null;
  }
}

function formatGiftName(name) {
  return formatNFTName(name);
}

function getSeasonInfo() {
  const d = new Date();
  const month = d.getMonth();
  const year = d.getFullYear();
  
  const monthsRu = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  const seasonsRu = ['Зима','Весна','Лето','Осень'];
  const seasonsEn = ['Winter','Spring','Summer','Autumn'];
  
  const months = currentLang === 'ru' ? monthsRu : monthsEn;
  const seasons = currentLang === 'ru' ? seasonsRu : seasonsEn;
  
  const seasonIdx = Math.floor(((month + 1) % 12) / 3);
  return {
    name: `${seasons[seasonIdx]} ${year}`,
    sub: `${months[month]} ${year}`
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function getSeasonTier(points) {
  const tiers = [
    { name: 'Bronze I', thr: 0 },
    { name: 'Bronze II', thr: 500 },
    { name: 'Silver I', thr: 1500 },
    { name: 'Silver II', thr: 3000 },
    { name: 'Gold I', thr: 5000 },
    { name: 'Gold II', thr: 8000 }
  ];
  let i = 0;
  for (let t = 0; t < tiers.length; t++) {
    if (points >= tiers[t].thr) i = t; else break;
  }
  const curr = tiers[i];
  const next = tiers[i + 1] || tiers[tiers.length - 1];
  const range = Math.max(1, next.thr - curr.thr);
  const pct = Math.max(0, Math.min(100, ((points - curr.thr) / range) * 100));
  return { tierName: curr.name, nextName: next.name, percent: pct };
}
