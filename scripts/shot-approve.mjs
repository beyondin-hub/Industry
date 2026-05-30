import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 700, deviceScaleFactor: 2 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await page.goto("http://localhost:3200/admin/proveedores", { waitUntil: "networkidle0", timeout: 60000 });
await wait(700);
// Aprobar la primera solicitud
const ok = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Aprobar");
  if (btn) { btn.click(); return true; } return false;
});
await wait(900);
await page.screenshot({ path: "/tmp/shots/approve-action.png" });
console.log("approved:", ok);
await browser.close();
