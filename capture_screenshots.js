import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    console.log('Starting comprehensive screenshot generation...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const page = await browser.newPage();
    const baseUrl = 'http://localhost:5173';
    // Artifacts directory
    const artifactDir = 'C:\\Users\\COMPUTER\\.gemini\\antigravity\\brain\\cb363d6b-3d5b-4552-9e33-3d9800e49ed8';

    const pages = [
        { url: '/', name: '01_Home' },
        { url: '/products', name: '02_Catalog' },
        { url: '/about', name: '03_About' },
        { url: '/branches', name: '04_Branches' },
        { url: '/contact', name: '05_Contact' },
        { url: '/holidays/hanukkah', name: '06_Hanukkah' },
        { url: '/holidays/shavuot', name: '07_Shavuot' },
        { url: '/terms', name: '08_Terms' },
        { url: '/accessibility', name: '09_Accessibility' },
        { url: '/404-not-found', name: '10_NotFound' } // Trigger 404 page
    ];

    await page.setViewport({ width: 1920, height: 1080 });

    for (const p of pages) {
        console.log(`Navigating to ${p.name} (${p.url})...`);
        try {
            await page.goto(`${baseUrl}${p.url}`, { waitUntil: 'networkidle0', timeout: 60000 });

            // Wait for specific animations
            await new Promise(r => setTimeout(r, 2000));

            // Special handling to scroll down slightly for full catalog load if lazy loading
            if (p.name.includes('Catalog')) {
                await page.evaluate(() => window.scrollBy(0, 500));
                await new Promise(r => setTimeout(r, 1000));
            }

            const outputPath = path.join(artifactDir, `${p.name}.png`);
            await page.screenshot({ path: outputPath, fullPage: true });
            console.log(`Captured ${outputPath}`);

        } catch (e) {
            console.error(`Error capturing ${p.name}:`, e);
        }
    }

    await browser.close();
    console.log('All screenshots captured successfully.');
})();
