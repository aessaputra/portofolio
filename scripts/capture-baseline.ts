#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import { setTimeout as wait } from "timers/promises";
import puppeteer from "puppeteer";

const routes = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/projects", name: "projects" },
  { path: "/articles", name: "articles" },
  { path: "/certifications", name: "certifications" },
  { path: "/sign-in", name: "sign-in" },
  { path: "/admin/(auth)/dashboard", name: "admin-dashboard" },
  { path: "/admin/projects", name: "admin-projects" },
  { path: "/admin/certifications", name: "admin-certifications" },
];

async function ensureDirectory(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function main() {
  const baseUrl = process.env.BASELINE_BASE_URL ?? "http://localhost:3000";
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .slice(0, 15);
  const outputDir = path.join("docs", "baseline", "screenshots", timestamp);
  await ensureDirectory(outputDir);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  for (const route of routes) {
    const targetUrl = new URL(route.path, baseUrl).toString();
    console.log(`Capturing ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: "networkidle0" });
    // give animations time to settle
    await wait(1000);
    const safeName = route.name.replace(/[^a-z0-9-_]/gi, "-");
    const screenshotPath = path.join(outputDir, `${safeName}.png`);
    await page.screenshot({
      path: screenshotPath as `${string}.png`,
      fullPage: true,
    });
  }

  await browser.close();
  console.log(`Baseline screenshots saved to ${outputDir}`);
}

main().catch((error) => {
  console.error("Baseline capture failed", error);
  process.exit(1);
});
