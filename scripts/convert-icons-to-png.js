const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "..", "assets", "generated-icons");
const targetDir = path.join(__dirname, "..", "assets", "images");

// Icon sizes for conversion
const conversions = [
	{ input: "icon.svg", output: "icon.png", size: 1024 },
	{
		input: "android-icon-foreground.svg",
		output: "android-icon-foreground.png",
		size: 1024,
	},
	{
		input: "android-icon-background.svg",
		output: "android-icon-background.png",
		size: 1024,
	},
	{
		input: "android-icon-monochrome.svg",
		output: "android-icon-monochrome.png",
		size: 1024,
	},
	{ input: "favicon.svg", output: "favicon.png", size: 48 },
	{ input: "splash-icon.svg", output: "splash-icon.png", size: 512 },
];

async function convertIcons() {
	console.log("🎨 Converting SVG icons to PNG...\n");

	for (const conversion of conversions) {
		const inputPath = path.join(sourceDir, conversion.input);
		const outputPath = path.join(targetDir, conversion.output);

		try {
			await sharp(inputPath)
				.resize(conversion.size, conversion.size)
				.png({ quality: 100, compressionLevel: 9 })
				.toFile(outputPath);

			console.log(
				`✓ Converted ${conversion.input} → ${conversion.output} (${conversion.size}x${conversion.size})`
			);
		} catch (error) {
			console.error(`✗ Error converting ${conversion.input}:`, error.message);
		}
	}

	console.log("\n✨ Icon conversion complete!");
	console.log("\n📝 Next steps:");
	console.log("1. Check the new icons in assets/images/");
	console.log("2. Run: npx expo prebuild --clean");
	console.log(
		"3. Rebuild your Android app: npx expo run:android --variant release"
	);
}

convertIcons().catch(console.error);
