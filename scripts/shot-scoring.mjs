import puppeteer from "puppeteer";

const base = process.env.BASE || "http://localhost:3100";
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await page.goto(base + "/admin/scoring", { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 700));
// Expandir el primer proveedor (peor score) para mostrar el desglose.
const rowBtns = await page.$$("button");
for (const b of rowBtns) {
  const t = await page.evaluate((el) => el.textContent, b);
  if (t && /\/ 10/.test(t)) { await b.click(); break; }
}
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: "/tmp/shot-scoring.png", fullPage: true });
console.log("saved scoring");
await browser.close();
