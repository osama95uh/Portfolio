/* eslint-disable */
/**
 * Perf/layout harness for the portfolio site.
 *
 * Usage: node scripts/perf-shots.js <before|after>
 * Produces:
 *   /tmp/opencode/site-<mode>-pc.png      (1440x900, full page, animations frozen)
 *   /tmp/opencode/site-<mode>-mobile.png  (390x844, DPR 2)
 *   /tmp/opencode/fps-<mode>.json         (mobile scroll FPS with 4x CPU throttle)
 *
 * PC screenshot is taken with animations paused + canvas hidden so the
 * before/after pixel diff only reflects structural/content changes.
 */
const puppeteer = require("puppeteer");
const fs = require("fs");

const MODE = process.argv[2] || "before";
const URL = "http://localhost:3000/";
const OUT = "/tmp/opencode";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FREEZE_STYLE = `
  canvas { visibility: hidden !important; }
  * { animation-play-state: paused !important; }
`;

async function fullyScroll(page) {
  // Walk the page so every whileInView / GSAP trigger fires once.
  await page.evaluate(async () => {
    const total = document.body.scrollHeight;
    for (let y = 0; y <= total; y += Math.round(window.innerHeight / 2)) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await sleep(2500); // let animations settle
}

async function scrollFps(page) {
  // Measure real rAF fps during a scroll sweep with CPU throttled 4x (mid-range phone-ish).
  const cdp = await page.createCDPSession();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await sleep(300);
  const result = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let frames = 0;
        let first = 0;
        let last = 0;
        const total = document.body.scrollHeight - window.innerHeight;
        let y = 0;
        const tick = (t) => {
          if (!first) first = t;
          last = t;
          frames++;
          y += 14; // constant scroll speed
          window.scrollTo(0, y);
          if (y < total && t - first < 5000) requestAnimationFrame(tick);
          else resolve({ frames, ms: last - first });
        };
        requestAnimationFrame(tick);
      }),
  );
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  const ms = Math.max(result.ms, 1);
  return { fps: Number(((result.frames / ms) * 1000).toFixed(1)), frames: result.frames, ms };
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
  });

  // ---------- PC ----------
  const pc = await browser.newPage();
  await pc.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await pc.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });
  await sleep(5000); // loader
  await fullyScroll(pc);
  await pc.addStyleTag({ content: FREEZE_STYLE });
  await sleep(400);
  await pc.screenshot({ path: `${OUT}/site-${MODE}-pc.png`, fullPage: true });
  console.log(`pc shot done (${MODE})`);

  // ---------- Mobile ----------
  const mob = await browser.newPage();
  await mob.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await mob.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });
  await sleep(5000);
  await fullyScroll(mob);
  await mob.addStyleTag({ content: FREEZE_STYLE });
  await sleep(400);
  await mob.screenshot({ path: `${OUT}/site-${MODE}-mobile.png`, fullPage: true });
  console.log(`mobile shot done (${MODE})`);

  // ---------- FPS (fresh load, no freeze) ----------
  const fps = await browser.newPage();
  await fps.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await fps.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });
  await sleep(4000);
  const m = await scrollFps(fps);
  fs.writeFileSync(`${OUT}/fps-${MODE}.json`, JSON.stringify(m));
  console.log(`scroll fps (${MODE}):`, m.fps);

  await browser.close();
})().catch((e) => {
  console.error("HARNESS FAILED:", e.message);
  process.exit(1);
});
