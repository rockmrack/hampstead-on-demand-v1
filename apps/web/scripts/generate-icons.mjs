/**
 * Generate PNG icons from SVG sources.
 * Run: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

// Icon sizes needed for PWA + App Store + Play Store
const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512, 1024];

// Source SVG — the 512x512 version scales cleanly
const svgSource = readFileSync(join(iconsDir, "icon-512x512.svg"));

// Apple touch icon source
const appleSvg = readFileSync(join(iconsDir, "apple-touch-icon.svg"));

// Favicon source
const faviconSvg = readFileSync(join(iconsDir, "favicon-32x32.svg"));

async function generate() {
  console.log("Generating PNG icons...\n");

  // Generate all sized icons
  for (const size of sizes) {
    const filename = size <= 32
      ? `favicon-${size}x${size}.png`
      : size === 180
      ? "apple-touch-icon.png"
      : `icon-${size}x${size}.png`;

    const src = size === 180 ? appleSvg : size <= 32 ? faviconSvg : svgSource;

    await sharp(src)
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, filename));

    console.log(`  ✓ ${filename} (${size}x${size})`);
  }

  // Generate root favicon.png as well
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(join(__dirname, "..", "public", "favicon.png"));
  console.log("  ✓ favicon.png (32x32)");

  // Generate splash screen (2732x2732, centered icon on stone background)
  const splashSize = 2732;
  const logoSize = 400;
  const logoBuf = await sharp(svgSource).resize(logoSize, logoSize).png().toBuffer();

  await sharp({
    create: {
      width: splashSize,
      height: splashSize,
      channels: 4,
      background: { r: 250, g: 250, b: 249, alpha: 1 }, // stone-50 = #fafaf9
    },
  })
    .composite([
      {
        input: logoBuf,
        top: Math.round((splashSize - logoSize) / 2),
        left: Math.round((splashSize - logoSize) / 2),
      },
    ])
    .png()
    .toFile(join(iconsDir, "splash.png"));
  console.log(`  ✓ splash.png (${splashSize}x${splashSize})`);

  console.log("\nDone! All icons generated.");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
