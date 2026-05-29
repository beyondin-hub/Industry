import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1100, deviceScaleFactor: 2 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function clickText(txt) {
  const h = await page.evaluateHandle((t) => [...document.querySelectorAll("button,a")].find((e) => e.textContent.trim().includes(t)), txt);
  const el = h.asElement(); if (el) await el.click(); return !!el;
}
await page.goto("http://localhost:3100/proveedor/productos", { waitUntil: "networkidle0", timeout: 60000 });
await wait(700);
await clickText("Usar ejemplo");
await wait(400);
await clickText("Enriquecer con IA");
await wait(2500);
await page.screenshot({ path: "/tmp/shots/importer-result.png", fullPage: true });
console.log("done");
await browser.close();
