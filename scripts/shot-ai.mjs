import puppeteer from "puppeteer";

const base = "http://localhost:3100";
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 2 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(txt) {
  const h = await page.evaluateHandle((t) => {
    const els = [...document.querySelectorAll("button,a")];
    return els.find((e) => e.textContent.trim().includes(t));
  }, txt);
  const el = h.asElement();
  if (el) await el.click();
  return !!el;
}

await page.goto(base + "/dashboard", { waitUntil: "networkidle0", timeout: 60000 });
await wait(800);
await clickText("Hey Novak");
await wait(700);
await page.type('input[placeholder="Escribe tu necesidad…"]', "Necesito cotizar 50 baleros 6205 urgentes");
await wait(300);
// enviar (botón submit con icono) -> presionar Enter
await page.keyboard.press("Enter");
await wait(2500);
await page.screenshot({ path: "/tmp/shots/ai-assistant.png" });
console.log("ai captured");
await browser.close();
