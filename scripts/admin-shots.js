/* eslint-disable */
const puppeteer = require("puppeteer");
const OUT = "/tmp/opencode";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // 1. Login screen
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(1200);
  await page.screenshot({ path: `${OUT}/admin-1-login.png` });

  // 2. Login through the real UI (fills the form)
  await page.click("#admin-password");
  await page.type("#admin-password", process.env.ADMIN_PW || "kZtfy6aQhKtYro4x");
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.body.innerText.includes("VISITOR_INTEL"), { timeout: 20000 });
  await sleep(800);
  await page.screenshot({ path: `${OUT}/admin-2-visitors.png` });

  // 3. Projects tab
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("PROJECTS"));
    btn?.click();
  });
  await sleep(1000);
  await page.screenshot({ path: `${OUT}/admin-3-projects.png` });

  // 4. Editor modal (first row edit)
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "edit");
    btn?.click();
  });
  await sleep(800);
  await page.screenshot({ path: `${OUT}/admin-4-editor.png` });

  console.log("admin shots done");
  await browser.close();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
