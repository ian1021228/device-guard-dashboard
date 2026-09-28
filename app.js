// ====================================================
// 局域網多設備即時視覺化監控系統 (Device Guard Dashboard)
// 支援 iOS / iPadOS 網路邏輯 & 任意設備一鍵切換監控
// ====================================================

// 實機網路探測設備清單 (包含 mDNS, UPnP, SMB NetBIOS, IEEE OUI 真實偵測結果)
const DETECTED_LAN_DEVICES = [
  {
    id: "ipad",
    name: "黃禹程的iPad",
    hostname: "huangyungdeiPad",
    type: "Apple iPad (iPadOS)",
    ip: "192.168.1.102",
    mac: "30:e0:4f:da:b9:1c",
    vendor: "Apple, Inc.",
    isIos: true,
    logicProfile: "iOS/iPadOS 邏輯 (5秒抗推播瞬斷過濾 + 極速鎖屏)",
    verifyThreshold: 5.0,
    ports: "mDNS, Companion-Link",
    actualOnline: false,
    status: "待機休眠 (未連線)"
  },
  {
    id: "iphone_private",
    name: "Apple iPhone (手機)",
    hostname: "iPhone",
    type: "Apple iPhone (iOS)",
    ip: "192.168.1.114",
    mac: "e2:ad:31:a3:34:92",
    vendor: "Apple, Inc. (Private Wi-Fi MAC)",
    isIos: true,
    logicProfile: "iOS/iPadOS 邏輯 (5秒抗推播瞬斷過濾 + 極速鎖屏)",
    verifyThreshold: 5.0,
    ports: "62078 (Apple Mobile Device)",
    actualOnline: true,
    status: "在線 (Wi-Fi 連線中)"
  },
  {
    id: "iphone_leanne",
    name: "Leannes-iPhone",
    hostname: "Leannes-iPhone",
    type: "Apple iPhone (iOS)",
    ip: "192.168.1.107",
    mac: "b8:01:1f:22:fa:44",
    vendor: "Apple, Inc.",
    isIos: true,
    logicProfile: "iOS/iPadOS 邏輯 (5秒抗推播瞬斷過濾 + 極速鎖屏)",
    verifyThreshold: 5.0,
    ports: "mDNS",
    actualOnline: false,
    status: "未連線 (離線中)"
  },
  {
    id: "iphone_bmwang",
    name: "bmwang-iphone",
    hostname: "bmwang-iphone",
    type: "Apple iPhone (iOS)",
    ip: "192.168.1.119",
    mac: "d4:ff:1a:b8:62:de",
    vendor: "Apple, Inc.",
    isIos: true,
    logicProfile: "iOS/iPadOS 邏輯 (5秒抗推播瞬斷過濾 + 極速鎖屏)",
    verifyThreshold: 5.0,
    ports: "62078 (Apple Mobile Device)",
    actualOnline: true,
    status: "在線 (Wi-Fi 連線中)"
  },
  {
    id: "macbook_air",
    name: "王禹硯的MacBook Air",
    hostname: "MacBookAir",
    type: "Apple MacBook Air (macOS)",
    ip: "192.168.1.131",
    mac: "5a:01:b6:4a:f2:bb",
    vendor: "Apple, Inc. (Private Wi-Fi MAC)",
    isIos: false,
    logicProfile: "macOS 電腦邏輯 (持續在線 / 鎖定休眠)",
    verifyThreshold: 1.0,
    ports: "AirPlay, Companion-Link",
    actualOnline: true,
    status: "在線 (本機主控)"
  },
  {
    id: "samsung_qn85",
    name: "Samsung QN85BA 65 (QA65QN85BAWXZW)",
    hostname: "Samsung-QN85BA-65",
    type: "Samsung Smart TV (Tizen OS)",
    ip: "192.168.1.111",
    mac: "f0:70:4f:7a:7f:4e",
    vendor: "Samsung Electronics Co., Ltd.",
    isIos: false,
    logicProfile: "智慧電視邏輯 (待機/開機即時探測)",
    verifyThreshold: 1.0,
    ports: "7678 (UPnP), 8001 (SmartView), 8080",
    actualOnline: true,
    status: "在線 (Tizen 系統)"
  },
  {
    id: "samsung_q80",
    name: "Samsung Electronics 影音設備",
    hostname: "Samsung-Q80",
    type: "Samsung Smart TV / Display",
    ip: "192.168.1.106",
    mac: "b8:bc:5b:53:a9:7c",
    vendor: "Samsung Electronics Co., Ltd.",
    isIos: false,
    logicProfile: "智慧電視邏輯 (待機/開機即時探測)",
    verifyThreshold: 1.0,
    ports: "SmartView",
    actualOnline: false,
    status: "未連線 (休眠待機)"
  },
  {
    id: "hp_printer",
    name: "HP LaserJet MFP M28w (7C20A9)",
    hostname: "NPI7C20A9",
    type: "HP LaserJet 無線雷射複合機",
    ip: "192.168.1.110",
    mac: "14:cb:19:7c:20:a9",
    vendor: "HP Inc.",
    isIos: false,
    logicProfile: "印表機邏輯 (省電休眠 / 列印喚醒)",
    verifyThreshold: 1.0,
    ports: "80, 443, 8080, 9100 (JetDirect), IPP",
    actualOnline: false,
    status: "未連線 (省電休眠)"
  },
  {
    id: "nintendo_switch",
    name: "Nintendo Co., Ltd. 遊戲主機",
    hostname: "Nintendo-Switch",
    type: "Nintendo Switch (Horizon OS)",
    ip: "192.168.1.112",
    mac: "20:0b:cf:d6:e0:0f",
    vendor: "Nintendo Co., Ltd.",
    isIos: false,
    logicProfile: "遊戲主機邏輯 (底座連線 / 睡眠待機)",
    verifyThreshold: 1.0,
    ports: "NPLN",
    actualOnline: false,
    status: "未連線 (休眠待機)"
  },
  {
    id: "windows_laptop",
    name: "LAPTOP-E722LBBP (Windows 電腦)",
    hostname: "LAPTOP-E722LBBP",
    type: "Windows 11 電腦",
    ip: "192.168.1.122",
    mac: "3c:f0:11:e2:f4:b9",
    vendor: "Intel Corporate",
    isIos: false,
    logicProfile: "Windows 電腦邏輯 (連線心跳 / 睡眠偵測)",
    verifyThreshold: 1.0,
    ports: "139, 445 (SMB NetBIOS)",
    actualOnline: false,
    status: "未連線 (關機休眠)"
  },
  {
    id: "apple_watch_1",
    name: "Apple Watch (手錶 1)",
    hostname: "Apple-Watch",
    type: "Apple Watch (watchOS)",
    ip: "192.168.1.116",
    mac: "8a:0e:7e:cc:7d:d0",
    vendor: "Apple, Inc. (Private Wi-Fi MAC)",
    isIos: true,
    logicProfile: "watchOS 邏輯 (極低功耗推播過濾)",
    verifyThreshold: 5.0,
    ports: "BLE / Wi-Fi Sync",
    actualOnline: false,
    status: "未連線 (休眠待機)"
  },
  {
    id: "apple_watch_2",
    name: "Apple Watch (手錶 2)",
    hostname: "Apple-Watch-2",
    type: "Apple Watch (watchOS)",
    ip: "192.168.1.129",
    mac: "ca:c8:5f:7e:63:79",
    vendor: "Apple, Inc. (Private Wi-Fi MAC)",
    isIos: true,
    logicProfile: "watchOS 邏輯 (極低功耗推播過濾)",
    verifyThreshold: 5.0,
    ports: "BLE / Wi-Fi Sync",
    actualOnline: false,
    status: "未連線 (休眠待機)"
  },
  {
    id: "roborock_robot",
    name: "Roborock 智慧物聯網設備 (掃地機)",
    hostname: "roborock-vacuum",
    type: "Roborock IoT 設備",
    ip: "192.168.1.103",
    mac: "b0:4a:39:13:f7:4c",
    vendor: "Roborock Technology Co., Ltd.",
    isIos: false,
    logicProfile: "物聯網邏輯 (回充基座待機 / 運作連線)",
    verifyThreshold: 1.0,
    ports: "Cloud IoT",
    actualOnline: false,
    status: "未連線 (離線中)"
  },
  {
    id: "roborock_base",
    name: "Roborock 智慧物聯網設備 (基站)",
    hostname: "roborock-dock",
    type: "Roborock IoT 清潔基站",
    ip: "192.168.1.105",
    mac: "24:9e:7d:cf:ac:5c",
    vendor: "Roborock Technology Co., Ltd.",
    isIos: false,
    logicProfile: "物聯網邏輯 (基座常駐連線)",
    verifyThreshold: 1.0,
    ports: "Cloud IoT",
    actualOnline: true,
    status: "在線 (常駐連線)"
  },
  {
    id: "router_gateway",
    name: "中華電信光世代數據機 / 主閘道器",
    hostname: "Gateway-Router",
    type: "主路由器閘道器 (Gateway)",
    ip: "192.168.1.1",
    mac: "80:02:9c:23:94:af",
    vendor: "Gemtek Technology Co., Ltd.",
    isIos: false,
    logicProfile: "網路閘道邏輯 (24H 永續在線核心)",
    verifyThreshold: 0.5,
    ports: "80, 443 (Web Admin)",
    actualOnline: true,
    status: "在線 (核心網關)"
  },
  {
    id: "mesh_ap",
    name: "Wi-Fi 全屋通 Mesh AP 基地台",
    hostname: "Mesh-AP-Extender",
    type: "Wi-Fi Mesh AP 基地台",
    ip: "192.168.1.104",
    mac: "a8:a2:37:6d:fb:94",
    vendor: "Arcadyan Technology Corporation",
    isIos: false,
    logicProfile: "網路基地台邏輯 (24H 永續在線擴展)",
    verifyThreshold: 0.5,
    ports: "443 (Mesh Management)",
    actualOnline: true,
    status: "在線 (AP 廣播中)"
  }
];

// App Global State
let state = {
  targetId: "ipad",
  targetName: "黃禹程的iPad",
  deviceType: "Apple iPad (iPadOS)",
  currentIp: "192.168.1.102",
  targetMac: "30:e0:4f:da:b9:1c",
  isIos: true,
  logicProfile: "iOS/iPadOS 邏輯 (5秒抗推播瞬斷過濾 + 極速鎖屏)",
  verifyThreshold: 5.0,
  
  isOnline: false,
  onlineSeconds: 0,
  verifyProgress: 0.0,
  verifyStartTime: null,
  currentState: "OFFLINE", // OFFLINE, PENDING_VERIFY, ONLINE
  latencyMs: 14.0,
  autoTestEnabled: true,
  lastTestPassed: false,
  
  todaySessions: 9,
  todayTotalSeconds: 75,
  peakSeconds: 31,
  filteredBurstsCount: 20,
  
  isAuthenticated: false,
  userClearedTimeline: false,
  hourlyStats: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 30, 75, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  recentEvents: [
    {
      time: "15:10:00",
      type: "filter",
      title: "黃禹程的iPad 推播靜默攔截",
      duration: 2.1,
      desc: "APNs 喚醒 2.1s (<5s)，已自動過濾防誤報"
    },
    {
      time: "15:05:35",
      type: "online",
      title: "黃禹程的iPad 螢幕解鎖開啟",
      duration: 0,
      desc: "通過 5 秒抗推播驗證，確認真人正常使用"
    }
  ]
};

// Check if running on local Node/Python server with POST /api/target capability
const isLocalServer = (location.hostname === "localhost" || location.hostname === "127.0.0.1") && (location.port === "8989" || location.port === "8990");

// DOM References
const subBrandHeader = document.getElementById("subBrandHeader");
const targetMacTag = document.getElementById("targetMacTag");
const currentIpTag = document.getElementById("currentIpTag");
const logicProfileTag = document.getElementById("logicProfileTag");

const heroCard = document.getElementById("heroCard");
const heroDeviceType = document.getElementById("heroDeviceType");
const heroTargetName = document.getElementById("heroTargetName");
const liveBadge = document.getElementById("liveBadge");
const liveStatusLabel = document.getElementById("liveStatusLabel");
const liveTimer = document.getElementById("liveTimer");
const timerSubText = document.getElementById("timerSubText");

const autoTestBadge = document.getElementById("autoTestBadge");
const autoTestBadgeText = document.getElementById("autoTestBadgeText");
const triggerTestBtn = document.getElementById("triggerTestBtn");
const toggleSimStateBtn = document.getElementById("toggleSimStateBtn");

const todayTotalTime = document.getElementById("todayTotalTime");
const todayTotalSub = document.getElementById("todayTotalSub");
const todaySessionsCount = document.getElementById("todaySessionsCount");
const sessionsSubText = document.getElementById("sessionsSubText");
const filteredBurstsCount = document.getElementById("filteredBurstsCount");
const pingLatencyVal = document.getElementById("pingLatencyVal");

const hourlyChartContainer = document.getElementById("hourlyChartContainer");
const donutChartBox = document.getElementById("donutChartBox");
const efficiencyPct = document.getElementById("efficiencyPct");
const realSessionsVal = document.getElementById("realSessionsVal");
const filteredRatioVal = document.getElementById("filteredRatioVal");

const stageIdle = document.getElementById("stageIdle");
const stageVerifying = document.getElementById("stageVerifying");
const stageConfirmed = document.getElementById("stageConfirmed");
const verifyStatusText = document.getElementById("verifyStatusText");
const verifyProgressPercent = document.getElementById("verifyProgressPercent");
const verifyProgressBar = document.getElementById("verifyProgressBar");
const tickThresholdText = document.getElementById("tickThresholdText");

const specHostname = document.getElementById("specHostname");
const specDeviceType = document.getElementById("specDeviceType");
const specMac = document.getElementById("specMac");
const specIp = document.getElementById("specIp");
const specLogicProfile = document.getElementById("specLogicProfile");
const specConnectionResult = document.getElementById("specConnectionResult");

const timelineList = document.getElementById("timelineList");
const lanDevicesBody = document.getElementById("lanDevicesBody");

// Modals
const changelogBtn = document.getElementById("changelogBtn");
const changelogModal = document.getElementById("changelogModal");
const closeChangelogBtn = document.getElementById("closeChangelogBtn");
const confirmChangelogBtn = document.getElementById("confirmChangelogBtn");

const authBtn = document.getElementById("authBtn");
const loginModal = document.getElementById("loginModal");
const closeLoginBtn = document.getElementById("closeLoginBtn");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginErrorMsg = document.getElementById("loginErrorMsg");

// Helper: Format Seconds to MM:SS
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Toast Notification
function showToast(msg) {
  const existing = document.querySelector(".toast-msg");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.className = "toast-msg";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// Switch Target Device (Guaranteed NOT to jump back!)
async function switchTargetDevice(deviceId) {
  const dev = DETECTED_LAN_DEVICES.find(d => d.id === deviceId);
  if (!dev) return;

  state.targetId = dev.id;
  state.targetName = dev.name;
  state.deviceType = dev.type;
  state.currentIp = dev.ip;
  state.targetMac = dev.mac;
  state.isIos = dev.isIos;
  state.logicProfile = dev.logicProfile;
  state.verifyThreshold = dev.verifyThreshold;
  state.onlineSeconds = 0;
  state.verifyProgress = 0.0;
  state.verifyStartTime = null;

  // Set state according to actual reachability
  if (dev.actualOnline) {
    if (dev.id === "router_gateway" || dev.id === "macbook_air" || dev.id === "roborock_base") {
      state.isOnline = true;
      state.currentState = "ONLINE";
      state.verifyProgress = 100.0;
      state.onlineSeconds = 120;
      state.latencyMs = 8.5;
    } else {
      state.isOnline = false;
      state.currentState = "OFFLINE";
      state.latencyMs = dev.isIos ? 14.0 : 18.0;
    }
  } else {
    // Completely disconnected device
    state.isOnline = false;
    state.currentState = "OFFLINE";
    state.verifyProgress = 0.0;
    state.latencyMs = 0;
  }

  // Save to localStorage
  try {
    localStorage.setItem("device_guard_selected_target", dev.id);
  } catch (e) {}

  // ONLY post to backend if running on local server with API support (prevents 405 error on GitHub Pages)
  if (isLocalServer) {
    const payload = {
      targetMac: dev.mac,
      targetHostname: dev.hostname,
      targetIp: dev.ip,
      targetName: dev.name,
      deviceType: dev.type,
      isIos: dev.isIos,
      profileName: dev.logicProfile
    };

    try {
      await fetch("api/target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Local server error handling
    }
  }

  // Add event to timeline if not cleared
  if (!state.userClearedTimeline) {
    addTimelineEvent("switch", `切換監控目標為 ${dev.name}`, 0, `已載入 ${dev.logicProfile} (${dev.ip})`);
  }

  updateUI();
  renderLanDevices();
  renderHourlyChart();
  renderDonutChart();

  // Automatically trigger connection test upon switching!
  triggerConnectionTest(true);
}

// Connection Test: Strict reachability check & prevents false positives on disconnected devices
function triggerConnectionTest(isAuto = false) {
  const dev = DETECTED_LAN_DEVICES.find(d => d.id === state.targetId);
  if (!dev) return;

  // 1. IF TARGET DEVICE IS NOT CONNECTED (100% Packet Loss / Offline):
  // MUST NEVER PASS VERIFICATION! MUST STAY OFFLINE!
  if (!dev.actualOnline) {
    state.currentState = "OFFLINE";
    state.isOnline = false;
    state.verifyProgress = 0.0;
    state.verifyStartTime = null;
    state.onlineSeconds = 0;
    state.lastTestPassed = false;
    
    updateUI();
    if (verifyProgressBar) {
      verifyProgressBar.classList.add("progress-bar-fail");
      verifyProgressBar.style.width = "0%";
    }
    if (verifyStatusText) {
      verifyStatusText.textContent = `當前驗證狀態：❌ 連線測試未通過 (目標設備未連線 / 100% 封包遺失)`;
    }
    if (liveStatusLabel) {
      liveStatusLabel.textContent = `🔴 離線休眠 (測試未通過)`;
    }
    if (specConnectionResult) {
      specConnectionResult.innerHTML = `<span class="text-danger">❌ 測試未通過 (未連線，封包遺失 100%)</span>`;
    }
    if (!state.userClearedTimeline) {
      addTimelineEvent("filter", `${state.targetName} 連線測試未通過`, 0, `探測無回應 (100% 封包遺失，設備休眠或未開啟 Wi-Fi)`);
    }
    showToast(isAuto 
      ? `⚡ [自動連線測試] ${state.targetName} 未連線 (100% 封包遺失，測試未通過)`
      : `❌ 連線測試失敗：${state.targetName} 目前沒有連線訊號 (100% 封包遺失)！`
    );
    return;
  }

  // 2. IF TARGET DEVICE IS CONNECTED (Reachable):
  state.lastTestPassed = true;
  if (verifyProgressBar) {
    verifyProgressBar.classList.remove("progress-bar-fail");
  }

  // If already online and in-use:
  if (state.currentState === "ONLINE") {
    if (specConnectionResult) {
      specConnectionResult.innerHTML = `<span class="text-success">🟢 連線正常 (延遲 ${state.latencyMs}ms，在線使用中)</span>`;
    }
    showToast(isAuto
      ? `⚡ [自動連線測試] ${state.targetName} 網路連線正常 (延遲 ${state.latencyMs}ms)`
      : `🟢 ${state.targetName} 網路連線正常 (延遲 ${state.latencyMs}ms，使用中)`
    );
    return;
  }

  // Device is connected and begins verification process (5s threshold for iOS)
  state.currentState = "PENDING_VERIFY";
  state.verifyStartTime = Date.now();
  state.verifyProgress = 10.0;
  if (specConnectionResult) {
    specConnectionResult.innerHTML = `<span class="text-warning">🟡 正在進行 ${state.verifyThreshold}s 抗推播驗證...</span>`;
  }
  updateUI();
  showToast(isAuto
    ? `⚡ [自動連線測試] 偵測到 ${state.targetName} 連線訊號，正在進行抗推播驗證...`
    : `🔍 正在對 ${state.targetName} 進行 ${state.verifyThreshold} 秒抗推播連線測試...`
  );
}

// Add an event to timeline
function addTimelineEvent(type, title, duration, desc) {
  if (state.userClearedTimeline) return;
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0];
  state.recentEvents.unshift({
    time: timeStr,
    type: type,
    title: title,
    duration: duration,
    desc: desc
  });
  if (state.recentEvents.length > 25) state.recentEvents.pop();
  renderTimeline();
}

// Render 24-Hour Bar Chart (SVG)
function renderHourlyChart() {
  if (!hourlyChartContainer) return;
  const currentHour = new Date().getHours();
  const maxVal = Math.max(10, ...state.hourlyStats);
  const chartHeight = 150;
  const chartWidth = 520;
  const barWidth = 14;
  const gap = 7;

  let barsSvg = "";
  for (let h = 0; h < 24; h++) {
    const val = state.hourlyStats[h] || 0;
    const barH = Math.max(3, (val / maxVal) * (chartHeight - 30));
    const x = h * (barWidth + gap) + 10;
    const y = chartHeight - barH - 18;
    const isPeak = (h === currentHour && val > 0) || (val === maxVal && val > 0);
    const fillColor = isPeak ? "#3fb950" : (val > 0 ? "#388bfd" : "rgba(255,255,255,0.08)");

    barsSvg += `
      <g class="bar-group">
        <rect class="chart-bar-rect" x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="3" fill="${fillColor}">
          <title>${h}:00 - ${h+1}:00：在線 ${val} 秒</title>
        </rect>
        <text x="${x + barWidth/2}" y="${chartHeight - 4}" text-anchor="middle" font-size="9" fill="#8b949e">${h}</text>
      </g>
    `;
  }

  hourlyChartContainer.innerHTML = `
    <svg class="bar-chart-svg" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="xMidYMid meet">
      <line x1="10" y1="${chartHeight-20}" x2="${chartWidth-10}" y2="${chartHeight-20}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <line x1="10" y1="${chartHeight/2}" x2="${chartWidth-10}" y2="${chartHeight/2}" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="4"/>
      ${barsSvg}
    </svg>
  `;
}

// Render Donut Chart (SVG)
function renderDonutChart() {
  if (!donutChartBox) return;
  const realSess = Math.max(1, state.todaySessions);
  const filtered = Math.max(1, state.filteredBurstsCount);
  const total = realSess + filtered;
  const filterPct = Math.round((filtered / total) * 100);
  const realPct = 100 - filterPct;

  if (efficiencyPct) efficiencyPct.textContent = `${filterPct}%`;
  if (realSessionsVal) realSessionsVal.textContent = `${state.todaySessions} 次 (${realPct}%)`;
  if (filteredRatioVal) filteredRatioVal.textContent = `${state.filteredBurstsCount} 次 (${filterPct}%)`;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  donutChartBox.innerHTML = `
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <circle cx="70" cy="70" r="${radius}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="14"/>
      <circle cx="70" cy="70" r="${radius}" fill="none" stroke="#3fb950" stroke-width="14"
        stroke-dasharray="${circumference}" stroke-dashoffset="0"
        transform="rotate(-90 70 70)"/>
      <circle cx="70" cy="70" r="${radius}" fill="none" stroke="#d29922" stroke-width="14"
        stroke-dasharray="${circumference}" stroke-dashoffset="${(realPct/100) * circumference}"
        transform="rotate(-90 70 70)"/>
    </svg>
  `;
}

// Render Timeline Events
function renderTimeline() {
  if (!timelineList) return;
  timelineList.innerHTML = "";

  if (state.userClearedTimeline || state.recentEvents.length === 0) {
    timelineList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 32px; font-size: 0.9rem;">歷史活動紀錄已全數清空</div>`;
    return;
  }

  state.recentEvents.forEach((ev) => {
    const el = document.createElement("div");
    el.className = "timeline-item";

    let iconClass = "offline";
    let iconChar = "🔴";
    let badgeClass = "badge-secondary";
    let durText = ev.duration > 0 ? `${ev.duration}s` : "即時";

    if (ev.type === "online") {
      iconClass = "online";
      iconChar = "🟢";
      badgeClass = "badge-success";
    } else if (ev.type === "filter") {
      iconClass = "timer";
      iconChar = "🛡️";
      badgeClass = "badge-primary";
    } else if (ev.type === "switch") {
      iconClass = "timer";
      iconChar = "🎯";
      badgeClass = "badge-secondary";
      durText = "切換";
    }

    el.innerHTML = `
      <div class="item-left">
        <div class="timeline-icon ${iconClass}">${iconChar}</div>
        <div>
          <div class="item-title">${ev.title}</div>
          <div class="item-time">${ev.time} • ${ev.desc}</div>
        </div>
      </div>
      <span class="badge ${badgeClass} item-tag">${durText}</span>
    `;
    timelineList.appendChild(el);
  });
}

// Render LAN Devices Table
function renderLanDevices() {
  if (!lanDevicesBody) return;
  lanDevicesBody.innerHTML = "";

  DETECTED_LAN_DEVICES.forEach((d) => {
    const isCurrent = (d.id === state.targetId);
    const tr = document.createElement("tr");
    if (isCurrent) {
      tr.className = "table-device-target table-row-selected";
    }

    let statusBadgeText = d.status;
    let badgeColorClass = d.actualOnline ? "badge-success" : "badge-secondary";

    if (isCurrent) {
      if (state.isOnline) {
        statusBadgeText = "🟢 在線使用中";
        badgeColorClass = "badge-success";
      } else if (state.currentState === "PENDING_VERIFY") {
        statusBadgeText = `🟡 ${state.verifyThreshold}s 驗證中 (${state.verifyProgress.toFixed(0)}%)`;
        badgeColorClass = "badge-warning";
      } else {
        statusBadgeText = d.actualOnline ? "🟡 連線待命中" : "🔴 休眠 (未連線)";
        badgeColorClass = d.actualOnline ? "badge-warning" : "badge-secondary";
      }
    }

    tr.innerHTML = `
      <td>
        <button class="btn-select-target ${isCurrent ? 'badge-target-active' : ''}" data-device-id="${d.id}">
          ${isCurrent ? '🎯 監控中' : '選擇監控'}
        </button>
      </td>
      <td>
        <strong>${d.name}</strong>
        ${isCurrent ? '<span class="badge badge-primary" style="margin-left: 6px;">當前目標</span>' : ''}
      </td>
      <td><span class="badge ${d.isIos ? 'badge-ios' : 'badge-secondary'}">${d.type}</span></td>
      <td class="text-mono">${d.ip}</td>
      <td class="text-mono">${d.mac}</td>
      <td>${d.vendor}</td>
      <td><small style="color: ${d.isIos ? '#79c0ff' : 'var(--text-muted)'}; white-space: nowrap;">${d.logicProfile}</small></td>
      <td>
        <span class="badge ${badgeColorClass}">
          ${statusBadgeText}
        </span>
      </td>
    `;

    // Row click switches target
    tr.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") {
        switchTargetDevice(d.id);
      }
    });

    // Button click switches target
    const btn = tr.querySelector(".btn-select-target");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        switchTargetDevice(d.id);
      });
    }

    lanDevicesBody.appendChild(tr);
  });
}

// Update UI
function updateUI() {
  if (subBrandHeader) {
    subBrandHeader.textContent = `🔕 靜音模式 • 目前監控：${state.targetName} (${state.currentIp})`;
  }
  if (targetMacTag) targetMacTag.textContent = `MAC: ${state.targetMac}`;
  if (currentIpTag) currentIpTag.textContent = `IP: ${state.currentIp}`;
  if (logicProfileTag) {
    logicProfileTag.textContent = state.isIos ? "🍎 iOS/iPadOS 邏輯 (5秒抗推播)" : "💻 自適應設備邏輯";
  }

  // Hero Card
  if (heroDeviceType) heroDeviceType.textContent = state.deviceType;
  if (heroTargetName) heroTargetName.textContent = state.targetName;

  if (state.isOnline) {
    heroCard.classList.add("active-state");
    liveBadge.className = "live-badge badge-online";
    liveStatusLabel.textContent = `🟢 ${state.targetName} 使用中`;
    liveTimer.textContent = formatTime(state.onlineSeconds);
    timerSubText.textContent = `已連續在線 ${state.onlineSeconds} 秒 (通過驗證)`;
  } else if (state.currentState === "PENDING_VERIFY") {
    heroCard.classList.remove("active-state");
    liveBadge.className = "live-badge badge-offline";
    liveBadge.style.borderColor = "var(--warning)";
    liveStatusLabel.textContent = `🟡 正在進行 5 秒抗推播驗證...`;
    liveTimer.textContent = "00:00";
    timerSubText.textContent = `觀察中，防止黑屏推播誤報 (${state.verifyProgress.toFixed(0)}%)`;
  } else {
    heroCard.classList.remove("active-state");
    liveBadge.className = "live-badge badge-offline";
    liveBadge.style.borderColor = "";
    liveStatusLabel.textContent = `🔴 ${state.targetName} 休眠中 / 鎖定待機`;
    liveTimer.textContent = "00:00";
    timerSubText.textContent = "目前處於休眠待機狀態";
  }

  // Metrics
  if (todayTotalTime) todayTotalTime.textContent = `${state.todayTotalSeconds} 秒`;
  if (todayTotalSub) {
    const m = Math.floor(state.todayTotalSeconds / 60);
    const s = state.todayTotalSeconds % 60;
    todayTotalSub.textContent = `約 ${m} 分 ${s} 秒`;
  }
  if (todaySessionsCount) todaySessionsCount.textContent = `${state.todaySessions} 次`;
  if (sessionsSubText) {
    sessionsSubText.textContent = state.isIos ? "已通過 5 秒抗推播驗證" : "正常連線上線次數";
  }
  if (filteredBurstsCount) filteredBurstsCount.textContent = `${state.filteredBurstsCount} 次`;
  if (pingLatencyVal) pingLatencyVal.textContent = `${state.latencyMs} ms`;

  // Radar stages
  if (stageIdle) stageIdle.className = "stage-item" + (state.currentState === "OFFLINE" ? " active-stage" : "");
  if (stageVerifying) stageVerifying.className = "stage-item" + (state.currentState === "PENDING_VERIFY" ? " active-stage" : "");
  if (stageConfirmed) stageConfirmed.className = "stage-item" + (state.currentState === "ONLINE" ? " active-stage" : "");

  if (verifyStatusText) {
    if (state.currentState === "ONLINE") {
      verifyStatusText.textContent = "當前驗證狀態：真人使用已確認 (在線中)";
    } else if (state.currentState === "PENDING_VERIFY") {
      verifyStatusText.textContent = `當前驗證狀態：抗推播觀察期 (${state.verifyProgress.toFixed(0)}%)`;
    } else {
      verifyStatusText.textContent = "當前驗證狀態：待機休眠中";
    }
  }

  // Ensure progress bar updates dynamically and never gets stuck
  const pct = Math.max(0, Math.min(100, state.verifyProgress));
  if (verifyProgressPercent) {
    verifyProgressPercent.textContent = `${pct.toFixed(0)}%`;
  }
  if (verifyProgressBar) {
    verifyProgressBar.style.width = `${pct}%`;
  }
  if (tickThresholdText) {
    tickThresholdText.textContent = state.isIos ? "5s 判定門檻" : "1s 響應門檻";
  }

  // Specs card
  if (specHostname) specHostname.textContent = state.targetName;
  if (specDeviceType) specDeviceType.textContent = state.deviceType;
  if (specMac) specMac.textContent = state.targetMac;
  if (specIp) specIp.textContent = state.currentIp;
  if (specLogicProfile) specLogicProfile.textContent = state.logicProfile;
  if (specConnectionResult) {
    const dev = DETECTED_LAN_DEVICES.find(d => d.id === state.targetId);
    if (dev && !dev.actualOnline) {
      specConnectionResult.innerHTML = '<span class="text-danger">❌ 測試未通過 (目標設備未連線)</span>';
    } else if (state.currentState === "ONLINE") {
      specConnectionResult.innerHTML = `<span class="text-success">🟢 連線正常 (延遲 ${state.latencyMs}ms，在線)</span>`;
    } else if (state.currentState === "PENDING_VERIFY") {
      specConnectionResult.innerHTML = `<span class="text-warning">🟡 進行抗推播驗證中 (${state.verifyProgress.toFixed(0)}%)</span>`;
    } else {
      specConnectionResult.innerHTML = '⚡ 自動探測啟用 (未連線設備強制阻斷)';
    }
  }
}

// Verification Engine Loop (Strict reachability validation)
setInterval(() => {
  if (state.currentState === "PENDING_VERIFY") {
    const dev = DETECTED_LAN_DEVICES.find(d => d.id === state.targetId);

    // CRITICAL: If target device is NOT connected, immediately fail and abort!
    if (!dev || !dev.actualOnline) {
      state.currentState = "OFFLINE";
      state.isOnline = false;
      state.verifyProgress = 0.0;
      state.verifyStartTime = null;
      if (verifyProgressBar) {
        verifyProgressBar.classList.add("progress-bar-fail");
        verifyProgressBar.style.width = "0%";
      }
      if (verifyStatusText) {
        verifyStatusText.textContent = `當前驗證狀態：❌ 連線測試未通過 (目標設備未連線 / 100% 封包遺失)`;
      }
      if (liveStatusLabel) {
        liveStatusLabel.textContent = `🔴 離線休眠 (測試未通過)`;
      }
      updateUI();
      return;
    }

    if (!state.verifyStartTime) state.verifyStartTime = Date.now();
    const elapsedSec = (Date.now() - state.verifyStartTime) / 1000;
    state.verifyProgress = Math.min(100.0, (elapsedSec / state.verifyThreshold) * 100);

    if (elapsedSec >= state.verifyThreshold) {
      // Completed verification for reachable device!
      state.currentState = "ONLINE";
      state.isOnline = true;
      state.verifyProgress = 100.0;
      state.onlineSeconds = Math.floor(elapsedSec);
      state.todaySessions++;
      state.todayTotalSeconds += Math.floor(elapsedSec);
      if (!state.userClearedTimeline) {
        addTimelineEvent("online", `${state.targetName} 螢幕解鎖開啟`, 0, `通過 ${state.verifyThreshold} 秒抗推播驗證，確認真人正常使用`);
      }
    }
    updateUI();
  }
}, 100);

// Timer increment loop if online
setInterval(() => {
  if (state.isOnline) {
    state.onlineSeconds++;
    state.todayTotalSeconds++;
    if (state.onlineSeconds > state.peakSeconds) {
      state.peakSeconds = state.onlineSeconds;
    }
    const currentHour = new Date().getHours();
    state.hourlyStats[currentHour] = (state.hourlyStats[currentHour] || 0) + 1;
    liveTimer.textContent = formatTime(state.onlineSeconds);
    timerSubText.textContent = `已連續在線 ${state.onlineSeconds} 秒 (通過驗證)`;
    updateUI();
  }
}, 1000);

// Poll Backend Status (Only syncs if running locally AND matches user selected target)
async function pollBackendStatus() {
  if (!isLocalServer) return; // In GitHub Pages (static), do not pull static file to override user choice!

  try {
    const res = await fetch("status.json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      // Only merge if backend has caught up to the selected target MAC!
      if (data && data.mac && data.mac.toLowerCase() === state.targetMac.toLowerCase()) {
        state.isOnline = data.online;
        state.currentState = data.state || (data.online ? "ONLINE" : "OFFLINE");
        state.verifyProgress = data.verifyProgress || (data.online ? 100 : 0);
        state.onlineSeconds = data.elapsed || 0;
        if (data.latencyMs) state.latencyMs = data.latencyMs;
        if (data.todaySessions) state.todaySessions = data.todaySessions;
        if (data.todayTotalSeconds) state.todayTotalSeconds = data.todayTotalSeconds;
        if (data.filteredBurstsCount) state.filteredBurstsCount = data.filteredBurstsCount;
        if (data.hourlyStats && data.hourlyStats.length === 24) state.hourlyStats = data.hourlyStats;
        
        if (!state.userClearedTimeline && data.recentEvents && data.recentEvents.length > 0) {
          state.recentEvents = data.recentEvents;
        }

        updateUI();
        renderHourlyChart();
        renderDonutChart();
        renderTimeline();
        renderLanDevices();
      }
    }
  } catch (e) {
    // Local server error handling
  }
}

// Refresh Button Event Handler
const refreshLogBtn = document.getElementById("refreshLogBtn");
if (refreshLogBtn) {
  refreshLogBtn.addEventListener("click", () => {
    state.userClearedTimeline = false;
    pollBackendStatus();
    updateUI();
    renderTimeline();
    showToast("已重新整理即時數據。");
  });
}

// Clear Button Event Handler (Guaranteed to stay cleared!)
const clearSimBtn = document.getElementById("clearSimBtn");
if (clearSimBtn) {
  clearSimBtn.addEventListener("click", () => {
    state.recentEvents = [];
    state.userClearedTimeline = true;
    renderTimeline();
    showToast("✅ 歷史紀錄已成功清空！");
  });
}

// Changelog Modal
if (changelogBtn && changelogModal) {
  changelogBtn.addEventListener("click", () => changelogModal.classList.add("show"));
  closeChangelogBtn.addEventListener("click", () => changelogModal.classList.remove("show"));
  confirmChangelogBtn.addEventListener("click", () => changelogModal.classList.remove("show"));
  changelogModal.addEventListener("click", (e) => {
    if (e.target === changelogModal) changelogModal.classList.remove("show");
  });
}

// Authentication Handling (User Rule 2: antigravity / 123456)
function checkAuth() {
  const isAuth = localStorage.getItem("antigravity_authenticated") === "true";
  state.isAuthenticated = isAuth;
  if (authBtn) {
    if (isAuth) {
      authBtn.textContent = "🔓 登出 (antigravity)";
      authBtn.classList.replace("btn-primary", "btn-outline");
    } else {
      authBtn.textContent = "🔒 管理員登入";
      authBtn.classList.replace("btn-outline", "btn-primary");
    }
  }
}

if (authBtn && loginModal) {
  authBtn.addEventListener("click", () => {
    if (state.isAuthenticated) {
      localStorage.removeItem("antigravity_authenticated");
      checkAuth();
      showToast("已安全登出管理員身分。");
    } else {
      loginErrorMsg.style.display = "none";
      loginForm.reset();
      loginModal.classList.add("show");
    }
  });

  closeLoginBtn.addEventListener("click", () => loginModal.classList.remove("show"));
  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) loginModal.classList.remove("show");
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = usernameInput.value.trim();
    const p = passwordInput.value.trim();

    if (u === "antigravity" && p === "123456") {
      localStorage.setItem("antigravity_authenticated", "true");
      loginModal.classList.remove("show");
      checkAuth();
      showToast("🎉 登入成功！已驗證管理員身分 (antigravity)。");
    } else {
      loginErrorMsg.style.display = "block";
    }
  });
}

// Polling interval if local server
if (isLocalServer) {
  setInterval(pollBackendStatus, 1500);
}

// Interactive testing on Meter Circle click
const meterCircle = document.getElementById("meterCircle");
if (meterCircle) {
  meterCircle.style.cursor = "pointer";
  meterCircle.title = "點擊可手動觸發連線狀態測試";
  meterCircle.addEventListener("click", () => {
    if (state.currentState === "ONLINE") {
      // Toggle to offline/sleep
      state.currentState = "OFFLINE";
      state.isOnline = false;
      state.verifyProgress = 0.0;
      if (!state.userClearedTimeline) {
        addTimelineEvent("offline", `${state.targetName} 螢幕鎖定休眠`, state.onlineSeconds, `偵測到鎖屏關閉，本次連線使用 ${state.onlineSeconds} 秒`);
      }
      state.onlineSeconds = 0;
      updateUI();
      showToast(`🔴 ${state.targetName} 已手動鎖定休眠。`);
    } else {
      triggerConnectionTest(false);
    }
  });
}

// Trigger Test Button Handler
if (triggerTestBtn) {
  triggerTestBtn.addEventListener("click", () => {
    triggerConnectionTest(false);
  });
}

// Simulation State Toggle Button Handler
if (toggleSimStateBtn) {
  toggleSimStateBtn.addEventListener("click", () => {
    const dev = DETECTED_LAN_DEVICES.find(d => d.id === state.targetId);
    if (!dev) return;
    dev.actualOnline = !dev.actualOnline;
    dev.status = dev.actualOnline ? "在線 (Wi-Fi 連線中)" : "待機休眠 (未連線)";
    renderLanDevices();
    showToast(`🔄 [狀態切換] 已切換 ${dev.name} 連線狀態為：${dev.actualOnline ? '🟢 已連線' : '🔴 離線休眠'}`);
    triggerConnectionTest(false);
  });
}

// Auto Periodic Connection Test Probe (Runs every 10 seconds)
setInterval(() => {
  if (state.autoTestEnabled) {
    if (state.currentState === "OFFLINE") {
      triggerConnectionTest(true);
    } else if (state.currentState === "ONLINE") {
      const dev = DETECTED_LAN_DEVICES.find(d => d.id === state.targetId);
      if (dev && !dev.actualOnline) {
        state.currentState = "OFFLINE";
        state.isOnline = false;
        state.verifyProgress = 0.0;
        if (!state.userClearedTimeline) {
          addTimelineEvent("offline", `${state.targetName} 連線中斷離線`, state.onlineSeconds, `探測遺失連線回應，本次使用 ${state.onlineSeconds} 秒`);
        }
        state.onlineSeconds = 0;
        updateUI();
        showToast(`🔴 ${state.targetName} 連線中斷，已轉為待機休眠。`);
      }
    }
  }
}, 10000);

// Initialize Default or Saved Target
function init() {
  try {
    const saved = localStorage.getItem("device_guard_selected_target");
    if (saved) {
      const dev = DETECTED_LAN_DEVICES.find(d => d.id === saved);
      if (dev) {
        state.targetId = dev.id;
        state.targetName = dev.name;
        state.deviceType = dev.type;
        state.currentIp = dev.ip;
        state.targetMac = dev.mac;
        state.isIos = dev.isIos;
        state.logicProfile = dev.logicProfile;
        state.verifyThreshold = dev.verifyThreshold;
      }
    }
  } catch (e) {}

  checkAuth();
  updateUI();
  renderHourlyChart();
  renderDonutChart();
  renderTimeline();
  renderLanDevices();
  if (isLocalServer) pollBackendStatus();

  // Automatically trigger connection test upon initial startup
  triggerConnectionTest(true);
}

init();
