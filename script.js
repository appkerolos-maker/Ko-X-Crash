﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿const el = {
  balance: document.getElementById("balance"),
  roundState: document.getElementById("roundState"),
  roundTimer: document.getElementById("roundTimer"),
  multiplier: document.getElementById("multiplier"),
  curveShadow: document.getElementById("curveShadow"),
  curvePath: document.getElementById("curvePath"),
  plane: document.querySelector(".plane"),
  explosion: document.getElementById("explosion"),
  planeCanvas: document.getElementById("planeCanvas"),
  planeRaw: document.getElementById("planeRaw"),
  betAmount: document.getElementById("betAmount"),
  autoCashout: document.getElementById("autoCashout"),
  betBtn: document.getElementById("betBtn"),
  cashoutBtn: document.getElementById("cashoutBtn"),
  message: document.getElementById("message"),
  clearBtn: document.getElementById("clearBtn"),
  quickButtons: document.querySelectorAll(".quick[data-amount]"),
  historyTable: document.getElementById("historyTable"),
  playersStat: document.getElementById("playersStat"),
  roundsStat: document.getElementById("roundsStat"),
  prizeStat: document.getElementById("prizeStat"),
  multiplierWrap: document.getElementById("multiplierWrap"),
  authOverlay: document.getElementById("authOverlay"),
  authLoginTab: document.getElementById("authLoginTab"),
  authRegisterTab: document.getElementById("authRegisterTab"),
  oneClickCreateBtn: document.getElementById("oneClickCreateBtn"),
  oneClickBox: document.getElementById("oneClickBox"),
  oneClickCaptchaQ: document.getElementById("oneClickCaptchaQ"),
  oneClickCaptchaA: document.getElementById("oneClickCaptchaA"),
  oneClickRefreshCaptcha: document.getElementById("oneClickRefreshCaptcha"),
  oneClickAgeOk: document.getElementById("oneClickAgeOk"),
  oneClickConfirmBtn: document.getElementById("oneClickConfirmBtn"),
  oneClickResultBox: document.getElementById("oneClickResultBox"),
  oneClickResultUser: document.getElementById("oneClickResultUser"),
  oneClickResultPass: document.getElementById("oneClickResultPass"),
  oneClickCopyBtn: document.getElementById("oneClickCopyBtn"),
  oneClickLoginNowBtn: document.getElementById("oneClickLoginNowBtn"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  loginUser: document.getElementById("loginUser"),
  loginPass: document.getElementById("loginPass"),
  regUser: document.getElementById("regUser"),
  regPass: document.getElementById("regPass"),
  regPass2: document.getElementById("regPass2"),
  authMessage: document.getElementById("authMessage"),
  logoutBtn: document.getElementById("logoutBtn"),
  depositBtn: document.getElementById("depositBtn"),
  adminBtn: document.getElementById("adminBtn"),
  // Deposit/Withdraw Overlay elements
  depositOverlay: document.getElementById("depositOverlay"),
  depositBackBtn: document.getElementById("depositBackBtn"),
  depositSection: document.getElementById("depositSection"),
  withdrawSection: document.getElementById("withdrawSection"),
  depositUsername: document.getElementById("depositUsername"),
  depositAmount: document.getElementById("depositAmount"),
  senderNumber: document.getElementById("senderNumber"),
  receiverNumber: document.getElementById("receiverNumber"),
  transferShot: document.getElementById("transferShot"),
  depositSubmit: document.getElementById("depositSubmit"),
  depositNote: document.getElementById("depositNote"),
  withdrawUsername: document.getElementById("withdrawUsername"),
  withdrawAmount: document.getElementById("withdrawAmount"),
  withdrawPhoneNumber: document.getElementById("withdrawPhoneNumber"),
  withdrawSubmit: document.getElementById("withdrawSubmit"),
  withdrawNote: document.getElementById("withdrawNote"),
  transactionsSection: document.getElementById("transactionsSection"),
  playerTransactionsBody: document.getElementById("playerTransactionsBody"),
  successModal: document.getElementById("successModal"),
  successTitle: document.getElementById("successTitle"),
  successMessage: document.getElementById("successMessage"),
  successOkBtn: document.getElementById("successOkBtn"),
};

const STORAGE_USERS = "melcrash_users";
const STORAGE_SESSION = "melcrash_session";
const STORAGE_BALANCES = "melcrash_user_balances";
const STORAGE_NOTIFICATIONS = "melcrash_user_notifications";
const STORAGE_ACTIVITY = "melcrash_user_activity";
const STORAGE_GAME_HISTORY = "melcrash_game_history";
const STORAGE_DEPOSITS = "melcrash_deposit_requests";
const STORAGE_WITHDRAWALS = "melcrash_withdrawal_requests";
const STORAGE_TRANSACTIONS = "melcrash_transactions";

let balance = 0;
let state = "waiting";
let roundCountdown = 3;
let crashPoint = 1.0;
let multiplier = 1.0;
let activeBet = null;
let countdownInterval = null;
let tickInterval = null;
let roundsTotal = 207226.93;
let prizePool = 353908.33;
let displayPrizePool = prizePool;
let prizePoolAnimInterval = null;
let addedAt2 = false;
let addedAt5 = false;
let addedAt10 = false;
let playersCount = Math.floor(Math.random() * 19001 + 1000);
let tipX = 24;
let tipY = 136;
let gameStarted = false;
let currentUser = null;
let oneClickCaptchaAnswer = null;
let oneClickCreatedCred = null;
let roundSerial = 0;
let currentTab = "الأحكام والشروط"; // افتراضي الشروط والأحكام

// --- Predictor Connection ---
const predictorChannel = new BroadcastChannel("melcrash-predictor");
let nextCrashPoint = null;
// ----------------------------

const VIEW_W = 300;
const VIEW_H = 142;
const TAIL_X_RATIO = 0.12;
const TAIL_Y_RATIO = 0.78;

const users = [
  "95******", "43******", "51******", "91******", "75******",
  "45******", "47******", "88******", "62******", "39******",
];

let tableRows = users.map((u, i) => ({
  user: u,
  multi: i % 3 === 0 ? 1.13 : 0,
  bet: Number((1000 + i * 300).toFixed(2)),
  profit: i % 3 === 0 ? Number((100 + i * 30).toFixed(2)) : 0,
}));

function generateFakePlayer(allowWin = true) {
  const fakeUsers = ["12******", "34******", "56******", "78******", "90******", "11******", "22******", "33******"];
  const user = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  const bet = Number((Math.random() * 5000 + 100).toFixed(2));
  let multi = 0;
  let profit = 0;

  if (allowWin && Math.random() < 0.3) {
    multi = Number((1 + Math.random() * 2).toFixed(2)); // 30% احتمالية ربح
    profit = Number((bet * (multi - 1)).toFixed(2));
  }

  return { user, multi, bet, profit };
}

function generateFakePlayers(count = 12, allowWin = true) {
  const list = [];
  for (let i = 0; i < count; i += 1) {
    list.push(generateFakePlayer(allowWin));
  }
  return list;
}

function clearRoundStats() {
  tableRows = [];
  playersCount = 0;
  roundsTotal = 0;
  prizePool = 0;
  updateStats();
  renderTable();
}

function resetRoundStats() {
  tableRows = generateFakePlayers(12, false);
  playersCount = Math.floor(Math.random() * 19001 + 1000);
  roundsTotal = Number((Math.random() * 500000 + 100000).toFixed(2)); // 100k - 600k
  prizePool = Number((Math.random() * 1000000 + 500000).toFixed(2)); // 500k - 1.5M
  updateStats();
  renderTable();
}

function toPanel(x, y) {
  const w = el.multiplierWrap ? el.multiplierWrap.clientWidth : VIEW_W;
  const h = el.multiplierWrap ? el.multiplierWrap.clientHeight : VIEW_H;
  return { x: (x / VIEW_W) * w, y: (y / VIEW_H) * h, w, h };
}

function preparePlaneSprite() {
  if (!el.planeRaw || !el.planeCanvas) return;
  const run = () => {
    const c = el.planeCanvas.getContext("2d");
    if (!c) return;
    const w = el.planeRaw.naturalWidth || 220;
    const h = el.planeRaw.naturalHeight || 120;
    el.planeCanvas.width = w;
    el.planeCanvas.height = h;
    c.clearRect(0, 0, w, h);
    c.drawImage(el.planeRaw, 0, 0, w, h);
    if (el.plane) {
      el.plane.style.opacity = "1";
      el.plane.style.display = "block";
    }
  };
  
  // إذا كانت الصورة لا تزال تظهر كمربع أصفر، فهذا يعني أن المسارassets/images/plane-edited.png غير متاح عند الرفع
  // سنقوم بتبسيط العملية وإعطائها أولوية التحميل
  el.planeRaw.crossOrigin = "anonymous";
  
  if (el.planeRaw.complete && el.planeRaw.naturalWidth > 0) run();
  else {
    el.planeRaw.onload = run;
    el.planeRaw.onerror = () => {
      // إذا فشلت الصورة تماماً، سنقوم برسم طائرة احترافية بالكود بدلاً من المربع الأصفر
      const c = el.planeCanvas.getContext("2d");
      if (c) {
        el.planeCanvas.width = 220;
        el.planeCanvas.height = 120;
        c.fillStyle = "#f4cf49";
        c.shadowBlur = 10;
        c.shadowColor = "rgba(0,0,0,0.5)";
        
        // رسم جسم الطائرة
        c.beginPath();
        c.ellipse(110, 60, 80, 25, 0, 0, Math.PI * 2);
        c.fill();
        
        // رسم الجناح
        c.beginPath();
        c.moveTo(90, 60);
        c.lineTo(40, 20);
        c.lineTo(70, 20);
        c.lineTo(120, 60);
        c.fill();
        
        // رسم الذيل
        c.beginPath();
        c.moveTo(170, 60);
        c.lineTo(200, 30);
        c.lineTo(210, 30);
        c.lineTo(190, 60);
        c.fill();
      }
      if (el.plane) {
        el.plane.style.opacity = "1";
        el.plane.style.display = "block";
      }
    };
  }
}

function formatMoney(num) {
  const n = Number(num);
  if (!Number.isFinite(n) || n === 0) return "00";
  return n.toFixed(2);
}

function formatStat(num) {
  return Number(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setMessage(text) {
  if (el.message) el.message.textContent = text;
}

function setSuccessMessage(text) {
  if (el.message) {
    el.message.textContent = text;
    el.message.style.color = "#8dffa7";
  }
}

function setAuthMessage(text, isOk = false) {
  if (!el.authMessage) return;
  el.authMessage.textContent = text;
  el.authMessage.style.color = isOk ? "#8dffa7" : "#ffb6bd";
}

function updateTopBalance() {
  if (currentUser) {
    balance = getUserBalanceByUsername(currentUser);
  }
  el.balance.textContent = formatMoney(balance);
}

function animatePrizePool(targetValue, duration = 900) {
  if (prizePoolAnimInterval) {
    clearInterval(prizePoolAnimInterval);
    prizePoolAnimInterval = null;
  }

  const startValue = displayPrizePool;
  const delta = targetValue - startValue;
  if (Math.abs(delta) < 0.01) {
    displayPrizePool = targetValue;
    el.prizeStat.textContent = formatStat(displayPrizePool);
    return;
  }

  const startTime = performance.now();
  prizePoolAnimInterval = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    displayPrizePool = startValue + delta * eased;
    el.prizeStat.textContent = formatStat(displayPrizePool);
    if (progress >= 1) {
      clearInterval(prizePoolAnimInterval);
      prizePoolAnimInterval = null;
      displayPrizePool = targetValue;
      el.prizeStat.textContent = formatStat(displayPrizePool);
    }
  }, 30);
}

function animatePrizePoolSequence(finalValue) {
  const firstTarget = Math.round(10000 + Math.random() * 2000 - 1000); // حوالي 10,000
  const secondTarget = Math.round(69999 + Math.random() * 5000 - 2500); // حوالي 69,999
  const cappedFirst = Math.max(8000, Math.min(firstTarget, finalValue * 0.1));
  const cappedSecond = Math.max(cappedFirst + 20000, Math.min(secondTarget, finalValue * 0.5));
  const sequence = [
    cappedFirst,
    cappedSecond,
    Math.round(finalValue),
  ];

  displayPrizePool = 0;
  el.prizeStat.textContent = formatStat(displayPrizePool);

  const durations = [700, 900, 1200];
  let stepIndex = 0;
  const runStep = () => {
    if (stepIndex >= sequence.length) return;
    animatePrizePool(sequence[stepIndex], durations[stepIndex]);
    const waitTime = durations[stepIndex] + 100;
    stepIndex += 1;
    if (stepIndex < sequence.length) {
      setTimeout(runStep, waitTime);
    }
  };

  runStep();
}

function updateStats() {
  el.playersStat.textContent = Math.round(playersCount).toString();
  el.roundsStat.textContent = formatStat(roundsTotal);
  if (state === "waiting") {
    displayPrizePool = 0;
    el.prizeStat.textContent = formatStat(displayPrizePool);
  } else {
    displayPrizePool = prizePool;
    el.prizeStat.textContent = formatStat(prizePool);
  }
}

function renderTable() {
  el.historyTable.innerHTML = "";
  let rowsToShow = [];

  if (currentTab === "السجل" && currentUser) {
    // أظهر تاريخ المستخدم
    const history = loadGameHistory();
    const userHistory = history[currentUser] || [];
    rowsToShow = userHistory.slice(0, 12).map(game => ({
      user: "أنت",
      multi: game.cashoutMultiplier || 0,
      bet: game.betAmount,
      profit: game.profit || 0,
    }));
  } else {
    // أظهر اللاعبين الافتراضيين أو شيء آخر
    rowsToShow = tableRows.slice(0, 12);
  }

  rowsToShow.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.user}</td>
      <td>x${row.multi ? row.multi.toFixed(2) : 0}</td>
      <td>${formatMoney(row.bet)} ج.م</td>
      <td class="profit ${row.profit > 0 ? "good" : "bad"}">${row.profit > 0 ? formatMoney(row.profit) : "0"} ج.م</td>
    `;
    el.historyTable.appendChild(tr);
  });
}

function generateCrashPoint() {
  const user = getLoggedInUser();
  const isLimitX2 = user && user.limitX2 === true;
  const isLimit150 = user && user.limit150 === true;
  const isLimit115 = user && user.limit115 === true;
  const isScriptMode = user && user.scriptMode === true;

  let point = 1.0;
  const r = Math.random();
  if (r < 0.56) point = 1 + Math.random() * 0.99;
  else if (r < 0.86) point = 2 + Math.random() * 2.99;
  else if (r < 0.97) point = 5 + Math.random() * 5.99;
  else point = 11 + Math.random() * 24;

  // تطبيق قيد الـ 1.15 أولاً لأنه الأكثر صرامة
  if (isLimit115) {
    point = 1.00 + Math.random() * 0.15; // نقطة عشوائية بين 1.00 و 1.15
  }
  // تطبيق قيد الـ 1.50 إذا كان مفعلاً ولم يطبق الـ 1.15
  else if (isLimit150 && point > 1.50) {
    point = 1.01 + Math.random() * 0.48; // نقطة عشوائية بين 1.01 و 1.49
  }
  // تطبيق قيد الـ ×2 إذا كان مفعلاً ولم يطبق ما سبق
  else if (isLimitX2 && point > 2.0) {
    point = 1.1 + Math.random() * 0.85; // نقطة عشوائية بين 1.1 و 1.95
  }

  return point;
}

function updateCurve(mult) {
  const p = Math.min((mult - 1) / 1.9, 1);
  const xEnd = 24 + p * 200;
  const yEnd = 136 - Math.pow(p, 1.5) * 86;
  const d = `M0 141 L ${xEnd.toFixed(1)} ${yEnd.toFixed(1)}`;

  el.curvePath.setAttribute("d", d);
  el.curveShadow.setAttribute("d", d);
  tipX = xEnd;
  tipY = yEnd;

  const dx = xEnd;
  const dy = yEnd - 141;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const tipPx = toPanel(xEnd, yEnd);
  const rect = el.plane.getBoundingClientRect();
  const pw = rect.width || 64;
  const ph = rect.height || 38;
  const left = Math.max(0, Math.min(tipPx.w - pw, tipPx.x - pw * TAIL_X_RATIO));
  const top = Math.max(0, Math.min(tipPx.h - ph, tipPx.y - ph * TAIL_Y_RATIO));
  el.plane.style.left = `${left}px`;
  el.plane.style.top = `${top}px`;
  el.plane.style.transform = `rotate(${angle + 5}deg)`;
}

function triggerExplosion() {
  if (!el.explosion) return;
  const p = toPanel(tipX, tipY);
  el.explosion.style.left = `${p.x}px`;
  el.explosion.style.top = `${p.y}px`;
  el.explosion.classList.remove("active");
  void el.explosion.offsetWidth;
  el.explosion.classList.add("active");
}

function setState(nextState) {
  state = nextState;
  
  // مزامنة الحالة مع السحاب للأدمن
  if (currentUser && typeof db !== 'undefined' && db) {
    db.ref(`users/${currentUser}/roundState`).set(nextState);
  }

  if (nextState === "waiting") {
    el.roundState.textContent = "في انتظار الجولة";
    el.roundState.style.color = "#b9c6f7";
  } else if (nextState === "running") {
    el.roundState.textContent = "جولة مباشرة";
    el.roundState.style.color = "#f6d163";
  } else {
    el.roundState.textContent = "انهارت";
    el.roundState.style.color = "#ff7c93";
  }
}

function stopGame() {
  clearInterval(countdownInterval);
  clearInterval(tickInterval);
  countdownInterval = null;
  tickInterval = null;
  gameStarted = false;
}

function startWaiting() {
  if (!gameStarted) return;

  clearInterval(countdownInterval);
  clearInterval(tickInterval);
  
  // مزامنة الحالة والعد التنازلي فوراً للأدمن
  roundCountdown = 7;
  if (currentUser && typeof db !== 'undefined' && db) {
    db.ref(`users/${currentUser}`).update({
      roundState: "waiting",
      currentCountdown: roundCountdown
    });
  }

  setState("waiting");
  multiplier = 1;

  // Generate and broadcast next crash point for predictor
  nextCrashPoint = Number(generateCrashPoint().toFixed(2));
  const predictionVal = nextCrashPoint + "x";
  predictorChannel.postMessage({ type: "PREDICTION", value: predictionVal });
  if (typeof syncPrediction === "function") syncPrediction(predictionVal);
  
  // تحديث نقطة الانهيار في السحاب للمستخدم الحالي عند بدء الانتظار وإعادة تعيين التحكم اليدوي
  if (currentUser && typeof db !== 'undefined' && db) {
    db.ref(`users/${currentUser}`).update({
      currentCrash: nextCrashPoint,
      currentBet: null, // إعادة ضبط الرهان في بداية كل جولة
      manualOverride: false // إعادة تعيين التحكم اليدوي في بداية كل جولة
    });
  }

  el.multiplier.textContent = `${roundCountdown.toFixed(1)}s`;
  el.multiplier.style.color = "#f4cf49"; // لون العد التنازلي (أصفر)
  updateCurve(1);
  if (el.plane) el.plane.style.opacity = "1";
  if (el.explosion) el.explosion.classList.remove("active");
  el.betBtn.disabled = false;
  el.cashoutBtn.disabled = true;

  countdownInterval = setInterval(() => {
    if (!gameStarted) return;
    roundCountdown -= 0.1;
    
    // إرسال العد التنازلي للأدمن لحظياً
    if (currentUser && typeof db !== 'undefined' && db) {
      db.ref(`users/${currentUser}/currentCountdown`).set(roundCountdown);
    }

    el.multiplier.textContent = `${Math.max(0, roundCountdown).toFixed(1)}s`;
    if (roundCountdown <= 0) {
      clearInterval(countdownInterval);
      startRound();
    }
  }, 100);
}

function placeBet() {
  if (state !== "waiting") return setMessage("يمكنك وضع الرهان خلال العد التنازلي فقط.");
  if (activeBet) return setMessage("تم تسجيل رهانك بالفعل لهذه الجولة.");

  const amount = Number(el.betAmount.value);
  const autoCashoutValue = Number(el.autoCashout.value);
  const autoCashout = Number.isFinite(autoCashoutValue) && autoCashoutValue >= 1.01 ? autoCashoutValue : null;
  if (!Number.isFinite(amount) || amount <= 0) return setMessage("أدخل قيمة رهان صحيحة.");
  if (amount > balance) return setMessage("الرصيد الحالي لا يكفي.");

  balance -= amount;
  if (currentUser) {
    setUserBalanceByUsername(currentUser, balance);
    // مزامنة حالة الرهان فقط للأدمن (نقطة الانهيار تم مزامنتها بالفعل في بداية العد التنازلي)
    if (typeof db !== 'undefined' && db) {
      db.ref(`users/${currentUser}`).update({
        currentBet: amount
      });
    }
  }
  touchUserActivity(currentUser, "place_bet");
  activeBet = { amount, autoCashout, cashedOut: false };
  updateTopBalance();
  el.betBtn.disabled = true;
  setSuccessMessage("تم وضع الرهان");

  // تسجيل بداية الجولة
  currentRoundData = {
    roundId: roundSerial,
    betAmount: amount,
    autoCashout,
    startTime: new Date().toISOString(),
  };
}

function cashout(isAuto = false) {
  if (state !== "running" || !activeBet || activeBet.cashedOut) return;
  const payout = activeBet.amount * multiplier;
  const profit = payout - activeBet.amount;
  activeBet.cashedOut = true;
  balance += payout;
  if (currentUser) {
    setUserBalanceByUsername(currentUser, balance);
    // مسح الرهان عند الخروج بنجاح وتحديث الحالة للأدمن
    if (typeof db !== 'undefined' && db) {
      db.ref(`users/${currentUser}`).update({ 
        currentBet: null,
        roundState: "cashed_out",
        lastCashout: multiplier.toFixed(2)
      });
    }
  }
  touchUserActivity(currentUser, isAuto ? "auto_cashout" : "cashout");
  updateTopBalance();
  el.cashoutBtn.disabled = true;
  tableRows.unshift({ user: profit > 0 ? currentUser : "أنت", multi: multiplier, bet: activeBet.amount, profit });
  prizePool += Math.max(0, profit * 0.35);
  playersCount += Math.random() * 4 - 1;
  animatePrizePool(prizePool);
  renderTable();
  setMessage(`${isAuto ? "تم الخروج التلقائي" : "تم الخروج"} عند ${multiplier.toFixed(2)}x - الربح ${formatMoney(profit)} ج.م`);

  // تسجيل نهاية الجولة
  if (currentRoundData && currentUser) {
    currentRoundData.cashoutMultiplier = multiplier;
    currentRoundData.profit = profit;
    currentRoundData.endTime = new Date().toISOString();
    addGameToHistory(currentUser, currentRoundData);
    currentRoundData = null;
  }
}

function startRound() {
  if (!gameStarted) return;
  setState("running");
  displayPrizePool = 0;
  el.prizeStat.textContent = formatStat(displayPrizePool);
  
  // التحقق من وجود تعديل يدوي من الأدمن قبل بدء الجولة
  if (currentUser && typeof db !== 'undefined' && db) {
    db.ref(`users/${currentUser}`).once('value', (snap) => {
      const data = snap.val();
      if (data && data.manualOverride === true) {
        crashPoint = Number(data.currentCrash);
        // إعادة تعيين العلم بعد الاستخدام
        db.ref(`users/${currentUser}/manualOverride`).set(false);
      } else {
        crashPoint = nextCrashPoint || Number(generateCrashPoint().toFixed(2));
      }
      proceedStartRound();
    });
  } else {
    crashPoint = nextCrashPoint || Number(generateCrashPoint().toFixed(2));
    proceedStartRound();
  }
}

function proceedStartRound() {
  nextCrashPoint = null; // reset for next
  
  roundSerial += 1;
  addedAt2 = false;
  addedAt5 = false;
  addedAt10 = false;
  animatePrizePoolSequence(prizePool);
  multiplier = 1;
  el.multiplier.textContent = "1.00x";
  el.multiplier.style.color = "#f5f8ff"; // لون المضاعف أثناء الجولة (أبيض)
  el.cashoutBtn.disabled = !activeBet;
  setMessage("الجولة بدأت. يمكنك الخروج الآن.");

  // مسح العد التنازلي من السحاب عند بدء الجولة
  if (currentUser && typeof db !== 'undefined' && db) {
    db.ref(`users/${currentUser}/currentCountdown`).remove();
  }

  // إضافة لاعبين افتراضيين يخرجون خلال الجولة
  const fakePlayersCount = Math.floor(Math.random() * 3) + 1; // 1-3 لاعبين
  for (let i = 0; i < fakePlayersCount; i++) {
    setTimeout(() => {
      if (!gameStarted || state !== "running") return;
      const fakePlayer = generateFakePlayer();
      fakePlayer.multi = Number((1 + Math.random() * (crashPoint - 1)).toFixed(2)); // يخرج قبل الانهيار
      fakePlayer.profit = Number((fakePlayer.bet * (fakePlayer.multi - 1)).toFixed(2));
      tableRows.unshift(fakePlayer);
      renderTable();
      prizePool += fakePlayer.profit * 0.35;
      playersCount += 1;
      animatePrizePool(prizePool);
    }, Math.random() * 2000 + 500); // بعد 0.5-2.5 ثانية
  }

  const startedAt = performance.now();
  tickInterval = setInterval(() => {
    if (!gameStarted) return;
    const elapsed = (performance.now() - startedAt) / 1000;
    multiplier = Number((Math.exp(elapsed * 0.22)).toFixed(2));
    el.multiplier.textContent = `${multiplier.toFixed(2)}x`;
    updateCurve(multiplier);

    // إضافة جوائز بناءً على المضاعف
    if (multiplier >= 2 && !addedAt2) {
      prizePool += 20000;
      addedAt2 = true;
      animatePrizePool(prizePool);
    }
    if (multiplier >= 5 && !addedAt5) {
      prizePool += 10000;
      addedAt5 = true;
      animatePrizePool(prizePool);
    }
    if (multiplier >= 10 && !addedAt10) {
      prizePool += 50000;
      addedAt10 = true;
      animatePrizePool(prizePool);
    }

    if (activeBet && activeBet.autoCashout && multiplier >= activeBet.autoCashout) {
      cashout(true);
      return;
    }
    if (multiplier >= crashPoint) {
      crashNow();
    }
  }, 50);
}

function crashNow() {
  clearInterval(tickInterval);
  if (el.plane) el.plane.style.opacity = "0";
  triggerExplosion();
  setState("crashed");
  el.multiplier.textContent = `${crashPoint.toFixed(2)}x`;
  el.multiplier.style.color = "#ff7b91";
  el.cashoutBtn.disabled = true;

  // إضافة لاعبين افتراضيين خسروا
  const losersCount = Math.floor(Math.random() * 2) + 1; // 1-2 لاعبين خسروا
  for (let i = 0; i < losersCount; i++) {
    const fakeLoser = generateFakePlayer();
    fakeLoser.multi = 0; // خسارة
    fakeLoser.profit = 0;
    tableRows.unshift(fakeLoser);
    playersCount += 1;
  }

  if (activeBet && !activeBet.cashedOut) {
    tableRows.unshift({ user: "أنت", multi: 0, bet: activeBet.amount, profit: 0 });
    setMessage(`انهارت عند ${crashPoint.toFixed(2)}x وخسرت ${formatMoney(activeBet.amount)} ج.م`);
  } else {
    setMessage(`انهارت الجولة عند ${crashPoint.toFixed(2)}x`);
  }

  roundsTotal += Math.random() * 5 + 0.8;
  playersCount += Math.random() * 6 - 2;
  prizePool += Math.random() * 400;
  animatePrizePool(prizePool);
  renderTable();
  activeBet = null;

  // امسح الإحصائيات فور انتهاء الجولة ثم أضف بيانات جديدة بعد لحظة
  clearRoundStats();
  setTimeout(resetRoundStats, 300);

  setTimeout(startWaiting, 2200);

  // تسجيل نهاية الجولة عند الانهيار
  if (currentRoundData && currentUser) {
    currentRoundData.crashMultiplier = crashPoint;
    currentRoundData.profit = 0;
    currentRoundData.endTime = new Date().toISOString();
    addGameToHistory(currentUser, currentRoundData);
    currentRoundData = null;
  }
}

function loadUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
    if (!Array.isArray(parsed)) return [];
    let changed = false;
    const normalized = parsed.map((u, i) => {
      if (u && u.userId) return u;
      changed = true;
      return { ...u, userId: `U${Date.now()}${i}` };
    });
    if (changed) {
      saveUsers(normalized);
    }
    return normalized;
  } catch {
    return [];
  }
}

function saveUsers(list) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(list));
}

function loadBalances() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_BALANCES) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveBalances(map) {
  localStorage.setItem(STORAGE_BALANCES, JSON.stringify(map));
}

function loadActivityMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_ACTIVITY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveActivityMap(map) {
  localStorage.setItem(STORAGE_ACTIVITY, JSON.stringify(map));
}

function loadGameHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_GAME_HISTORY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveGameHistory(map) {
  localStorage.setItem(STORAGE_GAME_HISTORY, JSON.stringify(map));
}

function addGameToHistory(username, gameData) {
  const history = loadGameHistory();
  if (!history[username]) history[username] = [];
  history[username].unshift(gameData);
  // احتفظ بآخر 50 لعبة فقط
  if (history[username].length > 50) history[username] = history[username].slice(0, 50);
  saveGameHistory(history);
}

function touchUserActivity(username, action = "") {
  if (!username) return;
  const map = loadActivityMap();
  map[username] = {
    lastAt: new Date().toISOString(),
    action,
  };
  saveActivityMap(map);
}

function getUserBalanceByUsername(username) {
  const balances = loadBalances();
  const value = Number(balances[username]);
  return Number.isFinite(value) ? value : 0;
}

function setUserBalanceByUsername(username, value, profitAmount = 0, mult = 0) {
  const balances = loadBalances();
  balances[username] = Number(value.toFixed(2));
  saveBalances(balances);

  // مزامنة فورية مع السحاب مع إرسال بيانات المكسب/الخسارة لجدول الأرباح
  if (typeof syncUserBalance === 'function') {
    syncUserBalance(username, balances[username], {
      profit: profitAmount,
      multiplier: mult
    });
  }
  updateTopBalance();
}

// تحديث النشاط كل 30 ثانية طالما اللاعب فاتح التطبيق
setInterval(() => {
  const user = getLoggedInUser();
  if (user && user.username && typeof syncActivity === 'function') {
    syncActivity(user.username);
  }
}, 30000);

function loadNotifications() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_NOTIFICATIONS) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotifications(list) {
  localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(list));
}

// --- Deposit & Withdrawal Helpers ---
function loadDepositRequests() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_DEPOSITS) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDepositRequests(list) {
  localStorage.setItem(STORAGE_DEPOSITS, JSON.stringify(list));
}

function loadWithdrawalRequests() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_WITHDRAWALS) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWithdrawalRequests(list) {
  localStorage.setItem(STORAGE_WITHDRAWALS, JSON.stringify(list));
}

function loadTransactions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_TRANSACTIONS) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTransactions(list) {
  localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(list));
}

function addTransaction(username, type, amount, status, details = "", id = null) {
  const list = loadTransactions();
  const txId = id || `TX${Date.now()}`;
  const existingIndex = list.findIndex(tx => tx.id === txId);
  
  const newTx = {
    id: txId,
    username,
    type, // 'deposit' or 'withdraw'
    amount: Number(amount.toFixed(2)),
    status, // 'pending', 'approved', 'rejected'
    details,
    createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    list[existingIndex] = newTx;
  } else {
    list.unshift(newTx);
  }

  // Keep last 100 transactions
  if (list.length > 100) list.splice(100);
  saveTransactions(list);

  // Sync to cloud if available
  if (typeof syncTransaction === 'function') {
    syncTransaction(newTx);
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("ar-EG");
}

function statusBadge(status) {
  const badgeClass = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending";
  const badgeText = status === "approved" ? "مكتمل" : status === "rejected" ? "مرفوض" : "قيد المراجعة";
  return `<span class="admin-badge ${badgeClass}">${badgeText}</span>`;
}

function renderPlayerTransactions() {
  if (!currentUser) return;
  const transactions = loadTransactions().filter(tx => tx.username === currentUser);
  el.playerTransactionsBody.innerHTML = "";

  if (!transactions.length) {
    el.playerTransactionsBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color:#b8c6f8;">لا توجد عمليات مسجلة</td></tr>`;
    return;
  }

  transactions.forEach(tx => {
    const typeText = tx.type === 'deposit' ? 'إيداع' : 'سحب';
    const typeClass = tx.type === 'deposit' ? 'good' : 'bad';
    const amountVal = Number(tx.amount || 0);
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
    tr.innerHTML = `
      <td style="padding: 10px; color: ${tx.type === 'deposit' ? '#8dffa7' : '#ff7b91'};">${typeText}</td>
      <td style="padding: 10px;">${amountVal.toFixed(2)}</td>
      <td style="padding: 10px;">${statusBadge(tx.status)}</td>
      <td style="padding: 10px; font-size: 11px; color: #b8c6f8;">${formatDate(tx.createdAt)}</td>
    `;
    el.playerTransactionsBody.appendChild(tr);
  });
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

function showSuccessModal(title, message) {
  if (el.successTitle) el.successTitle.textContent = title;
  if (el.successMessage) el.successMessage.textContent = message;
  if (el.successModal) el.successModal.classList.remove("hidden");
}

function hideSuccessModal() {
  if (el.successModal) el.successModal.classList.add("hidden");
}

function showDepositOverlay() {
  // جلب رقم الاستقبال من السحاب أولاً لضمان أنه الأحدث
  if (typeof db !== 'undefined' && db) {
    db.ref('settings/paymentNumber').once('value', (snap) => {
      const num = snap.val();
      if (num) {
        localStorage.setItem('melcrash_payment_number', num);
        // تحديث الرقم في حقل الإدخال مباشرة
        if (el.receiverNumber) {
          el.receiverNumber.value = num;
        }
      }
    });
  }

  if (el.depositUsername) el.depositUsername.value = currentUser || "";
  if (el.withdrawUsername) el.withdrawUsername.value = currentUser || "";
  if (el.depositOverlay) el.depositOverlay.classList.remove("hidden");
}

function hideDepositOverlay() {
  if (el.depositOverlay) el.depositOverlay.classList.add("hidden");
}

async function handleDepositSubmit() {
  if (!currentUser) return;

  const amount = Number(el.depositAmount.value);
  const senderNum = (el.senderNumber.value || "").trim();
  const receiverNum = (el.receiverNumber.value || "").trim();
  const shot = el.transferShot.files && el.transferShot.files[0];

  if (!Number.isFinite(amount) || amount <= 0) {
    el.depositNote.textContent = "ادخل مبلغ صحيح";
    el.depositNote.style.color = "#ffb6bd";
    return;
  }
  if (!senderNum) {
    el.depositNote.textContent = "اكتب رقم الهاتف الذي حولت منه";
    el.depositNote.style.color = "#ffb6bd";
    return;
  }
  if (!shot) {
    el.depositNote.textContent = "ارفع سكرين التحويل أولا";
    el.depositNote.style.color = "#ffb6bd";
    return;
  }

  el.depositNote.textContent = "جاري إرسال الطلب...";
  el.depositNote.style.color = "#b8c6f8";

  console.log("Starting deposit submission process...");

  let imageData = "";
  try {
    const originalImageData = await toDataUrl(shot);
    console.log("Image converted, length:", originalImageData.length);
    
    // ضغط الصورة قبل الإرسال
    if (typeof compressImage === 'function') {
        el.depositNote.textContent = "جاري ضغط الصورة...";
        imageData = await compressImage(originalImageData);
        console.log("Image compressed, new length:", imageData.length);
    } else {
        imageData = originalImageData;
    }
  } catch (err) {
    console.error("Image conversion failed:", err);
    el.depositNote.textContent = "حصل خطأ في قراءة صورة التحويل";
    el.depositNote.style.color = "#ffb6bd";
    return;
  }

  const txId = `TX${Date.now()}`;
  const requests = loadDepositRequests();
  const newReq = {
    id: `D${Date.now()}`,
    userId: `U${Date.now()}`, // fallback
    username: currentUser,
    amount: Number(amount.toFixed(2)),
    senderNumber: senderNum,
    receiverNumber: receiverNum,
    imageData,
    imageName: shot.name,
    transactionId: txId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  
  try {
    requests.unshift(newReq);
    saveDepositRequests(requests);
    touchUserActivity(currentUser, "deposit_request");

    // إضافة لسجل العمليات كطلب قيد المراجعة
    addTransaction(currentUser, 'deposit', amount, 'pending', `إيداع عبر رقم: ${senderNum}`, txId);

    // مزامنة مع السحاب
    if (typeof syncDepositRequest === 'function') {
      console.log("Calling syncDepositRequest...");
      await syncDepositRequest(newReq);
      console.log("syncDepositRequest finished.");
    } else {
      console.warn("syncDepositRequest function not found!");
    }

    el.depositNote.textContent = "تم إرسال الطلب بنجاح";
    el.depositNote.style.color = "#8dffa7";

    // تفريغ الحقول بعد النجاح
    el.depositAmount.value = "";
    el.senderNumber.value = "";
    el.transferShot.value = "";

    showSuccessModal("تم إنشاء طلب الإيداع!", "سيتم مراجعة طلبك قريباً من قبل فريق الدعم");
  } catch (syncErr) {
    console.error("Detailed sync error:", syncErr);
    el.depositNote.textContent = "فشل في إرسال الطلب للسحاب: " + syncErr.message;
    el.depositNote.style.color = "#ffb6bd";
    alert("حدث خطأ أثناء المزامنة: " + syncErr.message);
  }
}

async function handleWithdrawSubmit() {
  if (!currentUser) return;

  const amount = Number(el.withdrawAmount.value);
  const phone = (el.withdrawPhoneNumber.value || "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    el.withdrawNote.textContent = "ادخل مبلغ صحيح";
    el.withdrawNote.style.color = "#ffb6bd";
    return;
  }
  if (!phone) {
    el.withdrawNote.textContent = "ادخل رقم الهاتف";
    el.withdrawNote.style.color = "#ffb6bd";
    return;
  }

  const currentBalance = getUserBalanceByUsername(currentUser);
  if (amount > currentBalance) {
    el.withdrawNote.textContent = "الرصيد الحالي لا يكفي للسحب";
    el.withdrawNote.style.color = "#ffb6bd";
    return;
  }

  el.withdrawNote.textContent = "جاري إرسال الطلب...";
  el.withdrawNote.style.color = "#b8c6f8";

  // خصم المبلغ فوراً عند طلب السحب
  const newBalance = Number((currentBalance - amount).toFixed(2));
  setUserBalanceByUsername(currentUser, newBalance);
  balance = newBalance; // تحديث المتغير المحلي

  const txId = `TX${Date.now()}`;
  const withdrawals = loadWithdrawalRequests();
  const newW = {
    id: `W${Date.now()}`,
    userId: `U${Date.now()}`, // fallback
    username: currentUser,
    amount: Number(amount.toFixed(2)),
    phoneNumber: phone,
    transactionId: txId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  withdrawals.unshift(newW);
  saveWithdrawalRequests(withdrawals);
  touchUserActivity(currentUser, "withdrawal_request");

  // إضافة لسجل العمليات
  addTransaction(currentUser, 'withdraw', amount, 'pending', `سحب إلى رقم: ${phone}`, txId);

  // مزامنة مع السحاب
  if (typeof syncWithdrawalRequest === 'function') {
    syncWithdrawalRequest(newW);
  }

  el.withdrawNote.textContent = "تم إرسال الطلب وخصم المبلغ من رصيدك";
  el.withdrawNote.style.color = "#8dffa7";
  el.withdrawAmount.value = "";
  el.withdrawPhoneNumber.value = "";
  showSuccessModal("تم تقديم طلب السحب!", "تم خصم المبلغ من رصيدك وسيتم معالجة طلبك قريباً");
}

function showUnreadNotificationsForUser(username) {
  const list = loadNotifications();
  const userUnread = list.filter((n) => n.username === username && !n.read);
  if (!userUnread.length) return;

  const first = userUnread[0];
  setTimeout(() => {
    alert(first.text);
    setMessage(first.text);
  }, 200);

  const marked = list.map((n) => {
    if (n.username === username && !n.read) {
      return { ...n, read: true };
    }
    return n;
  });
  saveNotifications(marked);
}

function getLoggedInUser() {
  const session = localStorage.getItem(STORAGE_SESSION);
  if (!session) return null;
  const users = loadUsers();
  return users.find((u) => u.username === session) || null;
}

function saveSession(username) {
  localStorage.setItem(STORAGE_SESSION, username);
}

function clearSession() {
  localStorage.removeItem(STORAGE_SESSION);
}

function showLoginTab() {
  el.authLoginTab.classList.add("active");
  el.authRegisterTab.classList.remove("active");
  if (el.oneClickCreateBtn) el.oneClickCreateBtn.classList.remove("hidden");
  if (el.oneClickBox) el.oneClickBox.classList.add("hidden");
  if (el.oneClickResultBox) el.oneClickResultBox.classList.add("hidden");
  el.loginForm.classList.remove("hidden");
  el.registerForm.classList.add("hidden");
  setAuthMessage("");
}

function showRegisterTab() {
  el.authRegisterTab.classList.add("active");
  el.authLoginTab.classList.remove("active");
  if (el.oneClickCreateBtn) el.oneClickCreateBtn.classList.add("hidden");
  if (el.oneClickBox) el.oneClickBox.classList.add("hidden");
  if (el.oneClickResultBox) el.oneClickResultBox.classList.add("hidden");
  el.registerForm.classList.remove("hidden");
  el.loginForm.classList.add("hidden");
  setAuthMessage("");
}

function makeCaptcha() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  oneClickCaptchaAnswer = a + b;
  if (el.oneClickCaptchaQ) {
    el.oneClickCaptchaQ.textContent = `${a} + ${b} = ؟`;
  }
  if (el.oneClickCaptchaA) el.oneClickCaptchaA.value = "";
}

function makeOneClickUsername(list) {
  let username = "";
  do {
    username = `user${Math.floor(100000 + Math.random() * 900000)}`;
  } while (list.some((u) => u.username.toLowerCase() === username.toLowerCase()));
  return username;
}

function randomPassword() {
  return `P${Math.floor(100000 + Math.random() * 900000)}`;
}

function openOneClickPanel() {
  if (el.oneClickBox) el.oneClickBox.classList.remove("hidden");
  if (el.oneClickResultBox) el.oneClickResultBox.classList.add("hidden");
  if (el.oneClickAgeOk) el.oneClickAgeOk.checked = false;
  makeCaptcha();
  setAuthMessage("");
}

function showOneClickCredentials(username, password) {
  oneClickCreatedCred = { username, password };
  if (el.oneClickResultUser) el.oneClickResultUser.textContent = username;
  if (el.oneClickResultPass) el.oneClickResultPass.textContent = password;
  if (el.oneClickResultBox) el.oneClickResultBox.classList.remove("hidden");
  if (el.oneClickBox) el.oneClickBox.classList.add("hidden");
  if (el.loginUser) el.loginUser.value = username;
  if (el.loginPass) el.loginPass.value = password;
}

function loginFromOneClickResult() {
  if (!oneClickCreatedCred) return;
  saveSession(oneClickCreatedCred.username);
  setAuthMessage("تم تسجيل الدخول", true);
  enterGame(oneClickCreatedCred.username);
}

async function copyOneClickCredentials() {
  if (!oneClickCreatedCred) return;
  const text = `اسم المستخدم: ${oneClickCreatedCred.username}\nكلمة المرور: ${oneClickCreatedCred.password}`;
  try {
    await navigator.clipboard.writeText(text);
    setAuthMessage("تم نسخ اسم المستخدم وكلمة المرور", true);
  } catch {
    setAuthMessage("تعذر النسخ التلقائي، انسخ البيانات يدويًا");
  }
}

function submitOneClickCreate() {
  const ageOk = !!el.oneClickAgeOk?.checked;
  const captchaAnswer = Number(el.oneClickCaptchaA?.value || "");

  if (!ageOk) {
    setAuthMessage("لا يمكن إنشاء الحساب إلا بعد تأكيد أن العمر 18+");
    return;
  }
  if (!Number.isFinite(captchaAnswer) || captchaAnswer !== oneClickCaptchaAnswer) {
    setAuthMessage("إجابة الكابتشا غير صحيحة");
    makeCaptcha();
    return;
  }

  const list = loadUsers();
  const username = makeOneClickUsername(list);
  const password = randomPassword();
  const userId = `U${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const newUser = { userId, username, password, balance: 0 };
  list.push(newUser);
  saveUsers(list);

  // مزامنة مع السحاب
  if (typeof syncUserAccount === 'function') {
    syncUserAccount(newUser);
  }

  setAuthMessage("تم إنشاء الحساب بنجاح", true);
  showOneClickCredentials(username, password);
}

function enterGame(username) {
  currentUser = username;
  balance = getUserBalanceByUsername(username);
  updateTopBalance();
  el.authOverlay.classList.add("hidden");
  gameStarted = true;
  touchUserActivity(username, "login");
  setMessage(`أهلا ${username} - اكتب قيمة الرهان واضغط وضع الرهان قبل بداية الجولة.`);
  showUnreadNotificationsForUser(username);
  startWaiting();
  renderTable(); // أظهر تاريخ المستخدم
}

function exitGame() {
  stopGame();
  activeBet = null;
  currentUser = null;
  clearSession();
  el.authOverlay.classList.remove("hidden");
  el.roundTimer.textContent = "3.0s";
  el.multiplier.textContent = "1.00x";
  el.multiplier.style.color = "#f5f8ff";
  if (el.plane) el.plane.style.opacity = "1";
  updateCurve(1);
  showLoginTab();
  setAuthMessage("تم تسجيل الخروج بنجاح", true);
}

function onRegisterSubmit(e) {
  e.preventDefault();
  const username = (el.regUser.value || "").trim();
  const pass = (el.regPass.value || "").trim();
  const pass2 = (el.regPass2.value || "").trim();

  if (username.length < 3) return setAuthMessage("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
  if (pass.length < 4) return setAuthMessage("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
  if (pass !== pass2) return setAuthMessage("تأكيد كلمة المرور غير مطابق");

  const list = loadUsers();
  if (list.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return setAuthMessage("اسم المستخدم مستخدم بالفعل");
  }

  const userId = `U${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const newUser = { userId, username, password: pass, balance: 0 };
  list.push(newUser);
  saveUsers(list);
  
  // مزامنة مستخدم جديد مع السحاب
  if (typeof syncUserAccount === 'function') {
    syncUserAccount(newUser);
  }

  setAuthMessage("تم إنشاء الحساب بنجاح. سجل دخولك الآن", true);
  el.regUser.value = "";
  el.regPass.value = "";
  el.regPass2.value = "";
  showLoginTab();
}

function onLoginSubmit(e) {
  e.preventDefault();
  const username = (el.loginUser.value || "").trim();
  const pass = (el.loginPass.value || "").trim();

  if (!username || !pass) return setAuthMessage("اكتب اسم المستخدم وكلمة المرور");

  const list = loadUsers();
  const found = list.find((u) => u.username === username && u.password === pass);
  if (!found) return setAuthMessage("بيانات الدخول غير صحيحة");

  // تحقق من الحظر عند محاولة الدخول
  if (typeof db !== 'undefined' && db) {
    db.ref(`users/${found.username}/isBanned`).once('value', (snap) => {
      if (snap.val() === true) {
        setAuthMessage("تم حظر حسابك بسبب استخدام برامج غش");
      } else {
        saveSession(found.username);
        setAuthMessage("تم تسجيل الدخول", true);
        el.loginPass.value = "";
        enterGame(found.username);
      }
    });
  } else {
    saveSession(found.username);
    setAuthMessage("تم تسجيل الدخول", true);
    el.loginPass.value = "";
    enterGame(found.username);
  }
}

function bindEvents() {
  el.betBtn.addEventListener("click", placeBet);
  el.cashoutBtn.addEventListener("click", () => cashout(false));
  el.quickButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentValue = Number(el.betAmount.value) || 0;
      const addedValue = Number(btn.dataset.amount) || 0;
      el.betAmount.value = currentValue + addedValue;
    });
  });
  el.clearBtn.addEventListener("click", () => {
    el.betAmount.value = "";
  });

  el.authLoginTab.addEventListener("click", showLoginTab);
  el.authRegisterTab.addEventListener("click", showRegisterTab);
  if (el.oneClickCreateBtn) {
    el.oneClickCreateBtn.addEventListener("click", openOneClickPanel);
  }
  if (el.oneClickRefreshCaptcha) {
    el.oneClickRefreshCaptcha.addEventListener("click", makeCaptcha);
  }
  if (el.oneClickConfirmBtn) {
    el.oneClickConfirmBtn.addEventListener("click", submitOneClickCreate);
  }
  if (el.oneClickLoginNowBtn) {
    el.oneClickLoginNowBtn.addEventListener("click", loginFromOneClickResult);
  }
  if (el.oneClickCopyBtn) {
    el.oneClickCopyBtn.addEventListener("click", copyOneClickCredentials);
  }
  el.loginForm.addEventListener("submit", onLoginSubmit);
  el.registerForm.addEventListener("submit", onRegisterSubmit);
  el.logoutBtn.addEventListener("click", () => {
    const confirmLogout = window.confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟");
    if (!confirmLogout) return;
    exitGame();
  });
  if (el.depositBtn) {
    el.depositBtn.addEventListener("click", () => {
      showDepositOverlay();
    });
  }

  // --- Deposit Overlay Events ---
  if (el.depositBackBtn) {
    el.depositBackBtn.addEventListener("click", hideDepositOverlay);
  }
  if (el.depositSubmit) {
    el.depositSubmit.addEventListener("click", handleDepositSubmit);
  }
  if (el.withdrawSubmit) {
    el.withdrawSubmit.addEventListener("click", handleWithdrawSubmit);
  }
  if (el.successOkBtn) {
    el.successOkBtn.addEventListener("click", () => {
      hideSuccessModal();
      hideDepositOverlay();
    });
  }

  // Deposit/Withdraw Tabs
  const depositWithdrawTabs = document.querySelectorAll("#depositOverlay .withdraw-tabs .tab");
  depositWithdrawTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      depositWithdrawTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      el.depositSection.classList.add("hidden");
      el.withdrawSection.classList.add("hidden");
      el.transactionsSection.classList.add("hidden");

      if (target === "deposit") {
        el.depositSection.classList.remove("hidden");
      } else if (target === "withdraw") {
        el.withdrawSection.classList.remove("hidden");
      } else if (target === "transactions") {
        el.transactionsSection.classList.remove("hidden");
        renderPlayerTransactions();
      }
    });
  });

  // Quick amount buttons for Deposit
  const depositQuickBtns = document.querySelectorAll("[data-deposit-amount]");
  depositQuickBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      el.depositAmount.value = btn.dataset.depositAmount;
    });
  });

  // Quick amount buttons for Withdraw
  const withdrawQuickBtns = document.querySelectorAll("[data-withdraw-amount]");
  withdrawQuickBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      el.withdrawAmount.value = btn.dataset.withdrawAmount;
    });
  });
  if (el.adminBtn) {
    el.adminBtn.addEventListener("click", () => {
      window.location.href = "./admin.html";
    });
  }

  // Tab switching
  const tabs = document.querySelectorAll(".tabs .tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.textContent.trim();
      renderTable();
    });
  });
}

function boot() {
  // تسجيل Service Worker للإشعارات مثل واتساب
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker Registered', reg))
      .catch(err => console.error('Service Worker Registry Failed', err));
  }

  resetRoundStats();
  updateTopBalance();
  preparePlaneSprite();
  updateCurve(1);
  if (el.plane) el.plane.style.opacity = "1";
  bindEvents();

  // تهيئة Firebase
  if (typeof initFirebase === 'function') {
    initFirebase();
  }

  const session = localStorage.getItem(STORAGE_SESSION);
  const list = loadUsers();
  const validSession = session && list.some((u) => u.username === session);

  if (validSession) {
    enterGame(session);
  } else {
    showLoginTab();
    el.authOverlay.classList.remove("hidden");
    setAuthMessage("سجل الدخول للمتابعة");
  }
}

boot();
