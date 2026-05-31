import puppeteer from "puppeteer";

const base = process.env.BASE || "http://localhost:3100";
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await page.goto(base + "/admin/envios/nuevo", { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 800));
// Click "Cotizar tarifas"
const btns = await page.$$("button");
for (const b of btns) {
  const t = await page.evaluate((el) => el.textContent, b);
  if (t && t.includes("Cotizar")) { await b.click(); break; }
}
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: "/tmp/shot-rates.png", fullPage: true });
console.log("saved rates");
await browser.close();
