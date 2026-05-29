import puppeteer from "puppeteer";

const base = process.env.BASE || "http://localhost:3100";
// args: list of "path:outfile:width:height:fullPage"
const shots = process.argv.slice(2);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

for (const s of shots) {
  const [path, out, w = "1440", h = "900", full = "true"] = s.split("|");
  const page = await browser.newPage();
  await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 2 });
  await page.goto(base + path, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: out, fullPage: full === "true" });
  console.log("saved", out);
  await page.close();
}
await browser.close();
