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
  const handle = await page.evaluateHandle((t) => {
    const els = [...document.querySelectorAll("button,a")];
    return els.find((e) => e.textContent.trim().includes(t));
  }, txt);
  const el = handle.asElement();
  if (el) { await el.click(); }
  return !!el;
}

await page.goto(base + "/cotizar", { waitUntil: "networkidle0", timeout: 60000 });
await wait(800);
await page.screenshot({ path: "/tmp/shots/wizard-1.png" });
console.log("step1 empty");

// Buscar y agregar producto
await page.type('input[placeholder*="6205"]', "6205");
await wait(700);
await clickText("Balero de bolas 6205");
await wait(500);
await page.screenshot({ path: "/tmp/shots/wizard-1b.png" });
console.log("step1 filled");

// Continuar -> paso 2
await clickText("Continuar");
await wait(700);
await page.screenshot({ path: "/tmp/shots/wizard-2.png" });
console.log("step2");

// Continuar -> paso 3
await clickText("Continuar");
await wait(700);
await page.screenshot({ path: "/tmp/shots/wizard-3.png" });
console.log("step3");

// Enviar -> confirmación
await clickText("Enviar solicitud");
await wait(2500);
await page.screenshot({ path: "/tmp/shots/wizard-4.png" });
console.log("step4 confirmation");

await browser.close();
