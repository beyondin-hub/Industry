import puppeteer from "puppeteer";
const base = process.env.BASE || "http://localhost:3100";
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await page.goto(base + "/admin/config", { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 600));
// Click "Configurar 2FA"
for (const b of await page.$$("button")) {
  const t = await page.evaluate((el) => el.textContent, b);
  if (t && t.includes("Configurar 2FA")) { await b.click(); break; }
}
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: "/tmp/shot-2fa.png", fullPage: true });
console.log("saved 2fa");
await browser.close();
