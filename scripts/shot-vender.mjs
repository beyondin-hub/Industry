import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 860, deviceScaleFactor: 2 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// FAQ
await page.goto("http://localhost:3100/vender", { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate(() => {
  const el = [...document.querySelectorAll("h2")].find((h) => h.textContent.includes("Preguntas"));
  el?.scrollIntoView();
});
await wait(700);
await page.screenshot({ path: "/tmp/shots/vender-faq.png" });
console.log("faq");
await browser.close();
