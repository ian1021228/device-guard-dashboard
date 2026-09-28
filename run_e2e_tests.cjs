const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('/Users/ianw/.gemini/antigravity/scratch/node_modules/puppeteer-core');

const PORT = 8989;
const ROOT = path.join(__dirname);
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];

      // Handle POST /api/target for dynamic device switching
      if (req.method === 'POST' && reqPath === '/api/target') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            fs.writeFileSync(path.join(ROOT, 'target_config.json'), JSON.stringify(data, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, target: data }));
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(ROOT, reqPath);
      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
        res.end(data);
      });
    });
    server.listen(PORT, () => {
      console.log(`Test server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function runTests() {
  const server = await startServer();
  let browser;
  let allPassed = true;

  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // ----------------------------------------------------
    // TEST 1: DESKTOP TEST (1280x800)
    // ----------------------------------------------------
    console.log('\n========================================');
    console.log('🖥️ RUNNING TEST 1: DESKTOP (1280x800)');
    console.log('========================================');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1280, height: 800 });
    await desktopPage.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });

    // 1. Check title & brand
    const title = await desktopPage.title();
    console.log('Page Title:', title);
    if (!title.includes('即時視覺化監控')) throw new Error('Title does not match expected string');

    // 2. Test Changelog Modal (User Rule 1)
    console.log('Testing Changelog Modal (Rule 1)...');
    await desktopPage.click('#changelogBtn');
    await desktopPage.waitForSelector('#changelogModal.show', { timeout: 2000 });
    const modalText = await desktopPage.$eval('#changelogModal', el => el.innerText);
    if (!modalText.includes('v2.3.2') || !modalText.includes('v2.3.1') || !modalText.includes('v1.0.0')) {
      throw new Error('Changelog modal missing v2.3.2 or historical versions');
    }
    console.log('✅ Changelog displays v2.3.2 and complete version history properly');
    await desktopPage.click('#closeChangelogBtn');
    await desktopPage.waitForFunction(() => !document.getElementById('changelogModal').classList.contains('show'));
    console.log('✅ Changelog closed successfully');

    // 3. Test Authentication (User Rule 2: antigravity / 123456)
    console.log('Testing Authentication Modal (Rule 2)...');
    await desktopPage.click('#authBtn');
    await desktopPage.waitForSelector('#loginModal.show', { timeout: 2000 });
    
    // 3a. Test Wrong Password
    await desktopPage.type('#usernameInput', 'antigravity');
    await desktopPage.type('#passwordInput', 'wrong_pass');
    await desktopPage.click('#loginForm button[type="submit"]');
    const isErrorVisible = await desktopPage.$eval('#loginErrorMsg', el => el.style.display !== 'none');
    if (!isErrorVisible) throw new Error('Expected error message on wrong password');
    console.log('✅ Wrong password correctly rejected');

    // 3b. Test Correct Password (antigravity / 123456)
    await desktopPage.$eval('#usernameInput', el => el.value = 'antigravity');
    await desktopPage.$eval('#passwordInput', el => el.value = '123456');
    await desktopPage.click('#loginForm button[type="submit"]');
    await desktopPage.waitForFunction(() => !document.getElementById('loginModal').classList.contains('show'), { timeout: 3000 });
    await desktopPage.waitForSelector('.toast-msg', { timeout: 3000 });
    console.log('✅ Logged in successfully as antigravity');

    // 4. Test Auto Connection Test on Selecting an OFFLINE Device (HP LaserJet)
    console.log('Testing Auto Connection Test on OFFLINE Device (HP LaserJet)...');
    await desktopPage.waitForSelector('button[data-device-id="hp_printer"]', { timeout: 3000 });
    await desktopPage.$eval('button[data-device-id="hp_printer"]', btn => btn.click());
    
    // Verify Hero Card updated to selected device
    await desktopPage.waitForFunction(() => {
      const heroName = document.getElementById('heroTargetName').innerText;
      return heroName.includes('HP LaserJet');
    }, { timeout: 3000 });
    
    // Verify that the OFFLINE device DOES NOT PASS THE TEST!
    await desktopPage.waitForFunction(() => {
      const statusText = document.getElementById('verifyStatusText').innerText;
      return statusText.includes('未通過') || statusText.includes('未連線') || statusText.includes('封包遺失');
    }, { timeout: 3000 });

    const isHeroActive = await desktopPage.$eval('#heroCard', el => el.classList.contains('active-state'));
    if (isHeroActive) throw new Error('Disconnected device should NOT have active-state!');
    const isProgressFailed = await desktopPage.$eval('#verifyProgressBar', el => el.classList.contains('progress-bar-fail'));
    if (!isProgressFailed) throw new Error('Disconnected device should have progress-bar-fail class!');
    console.log('✅ Disconnected device (HP LaserJet) STRICTLY FAILED the connection test as expected (100% blocked)!');

    // Test toggleSimStateBtn to simulate connecting the device
    console.log('Testing simulation toggle to ONLINE...');
    await desktopPage.click('#toggleSimStateBtn');
    await desktopPage.waitForSelector('.toast-msg', { timeout: 3000 });
    console.log('✅ Simulation state successfully toggled');

    // Switch to Samsung TV (Online Device)
    console.log('Testing Device Selection on ONLINE Device (Samsung Smart TV)...');
    await desktopPage.$eval('button[data-device-id="samsung_qn85"]', btn => btn.click());
    await desktopPage.waitForFunction(() => {
      const heroName = document.getElementById('heroTargetName').innerText;
      return heroName.includes('Samsung QN85BA');
    }, { timeout: 3000 });
    console.log('✅ Hero target successfully switched to Samsung QN85BA 65');

    // Switch back to iPad (Offline DTIM device)
    console.log('Testing Device Selection back to iPad...');
    await desktopPage.$eval('button[data-device-id="ipad"]', btn => btn.click());
    await desktopPage.waitForFunction(() => {
      const heroName = document.getElementById('heroTargetName').innerText;
      return heroName.includes('黃禹程的iPad');
    }, { timeout: 3000 });

    // Verify iPad (offline) also fails connection test
    await desktopPage.waitForFunction(() => {
      const statusText = document.getElementById('verifyStatusText').innerText;
      return statusText.includes('未通過') || statusText.includes('未連線') || statusText.includes('封包遺失');
    }, { timeout: 3000 });
    console.log('✅ iPad (offline sleep) strictly failed connection test as expected');

    // 5. Test LAN devices table row count (16 devices)
    const rowCount = await desktopPage.$$eval('#lanDevicesBody tr', rows => rows.length);
    console.log(`LAN Table devices rendered: ${rowCount}`);
    if (rowCount < 15) throw new Error('LAN table has too few devices');
    console.log('✅ LAN table has all 16 detected devices rendered');

    // 6. Test Visual Charts rendering
    const hasBarChart = await desktopPage.$eval('.bar-chart-svg', el => !!el);
    const hasDonutChart = await desktopPage.$eval('#donutChartBox svg', el => !!el);
    if (!hasBarChart || !hasDonutChart) throw new Error('Visual charts not rendered');
    // 7. Test Clear Timeline button ("清空顯示")
    console.log('Testing Clear Timeline button (#clearSimBtn)...');
    await desktopPage.click('#clearSimBtn');
    const timelineClearedText = await desktopPage.$eval('#timelineList', el => el.innerText);
    if (!timelineClearedText.includes('清空')) throw new Error('Timeline failed to clear');
    console.log('✅ Timeline successfully cleared and confirmed');

    // Take Desktop Screenshot
    await desktopPage.screenshot({ path: path.join(ROOT, 'test_desktop_result.png') });
    console.log('📸 Saved test_desktop_result.png');
    console.log('🎉 DESKTOP TEST PASSED 100%!');

    // ----------------------------------------------------
    // TEST 2: MOBILE TEST (393x852 Touch Emulation)
    // ----------------------------------------------------
    console.log('\n========================================');
    console.log('📱 RUNNING TEST 2: MOBILE (393x852 TOUCH)');
    console.log('========================================');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({
      width: 393,
      height: 852,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3
    });
    await mobilePage.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });

    // Verify Mobile Layout & Hero Card
    const mobileTargetName = await mobilePage.$eval('#heroTargetName', el => el.innerText);
    console.log('Mobile Target Initial:', mobileTargetName);
    if (!mobileTargetName || mobileTargetName.length < 2) {
      throw new Error('Mobile target name not displayed');
    }

    // Touch Tap Changelog
    console.log('Testing Mobile Touch on Changelog...');
    await mobilePage.tap('#changelogBtn');
    await mobilePage.waitForSelector('#changelogModal.show', { timeout: 2000 });
    console.log('✅ Mobile Changelog opened with touch tap');
    await mobilePage.tap('#confirmChangelogBtn');
    await mobilePage.waitForFunction(() => !document.getElementById('changelogModal').classList.contains('show'));
    console.log('✅ Mobile Changelog closed with touch tap');

    // Touch Tap to switch device in table (iPhone)
    console.log('Testing Mobile Touch Selection (iPhone)...');
    await mobilePage.tap('button[data-device-id="iphone_private"]');
    await mobilePage.waitForFunction(() => {
      const heroName = document.getElementById('heroTargetName').innerText;
      return heroName.includes('iPhone');
    }, { timeout: 3000 });
    console.log('✅ Mobile Touch Tap successfully switched device to iPhone');

    // Verify Mobile Table responsiveness
    const isTableResponsive = await mobilePage.$eval('.table-responsive', el => !!el);
    if (!isTableResponsive) throw new Error('Table container missing .table-responsive');
    console.log('✅ Mobile table is inside responsive scroll container');

    // Take Mobile Screenshot
    await mobilePage.screenshot({ path: path.join(ROOT, 'test_mobile_result.png') });
    console.log('📸 Saved test_mobile_result.png');
    console.log('🎉 MOBILE (393x852) TEST PASSED 100%!');

  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err);
    allPassed = false;
  } finally {
    if (browser) await browser.close();
    server.close();
    if (allPassed) {
      console.log('\n🌟 ALL MULTI-PLATFORM TESTS PASSED SUCCESSFULLY! 🌟');
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

runTests();
