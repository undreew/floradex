#!/usr/bin/env node

/**
 * Verification script for Plant.id integration
 * Run this to check if everything is properly set up
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying Plant.id Integration Setup...\n");

let hasErrors = false;

// Check .env file
console.log("1. Checking .env file...");
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
	const envContent = fs.readFileSync(envPath, "utf8");
	if (envContent.includes("EXPO_PUBLIC_PLANT_ID_KEY=")) {
		const match = envContent.match(/EXPO_PUBLIC_PLANT_ID_KEY=(.+)/);
		if (match && match[1] && match[1].trim() !== "your_api_key_here") {
			console.log("   ✅ .env file exists with API key");
		} else {
			console.log("   ⚠️  .env file exists but API key not configured");
			console.log("   → Add your Plant.id API key to .env");
			hasErrors = true;
		}
	} else {
		console.log("   ❌ EXPO_PUBLIC_PLANT_ID_KEY not found in .env");
		hasErrors = true;
	}
} else {
	console.log("   ❌ .env file not found");
	hasErrors = true;
}

// Check services/plantId.ts
console.log("\n2. Checking services/plantId.ts...");
const plantIdPath = path.join(__dirname, "services", "plantId.ts");
if (fs.existsSync(plantIdPath)) {
	const plantIdContent = fs.readFileSync(plantIdPath, "utf8");
	if (plantIdContent.includes("EXPO_PUBLIC_PLANT_ID_KEY")) {
		console.log("   ✅ Plant.id service file exists and configured");
	} else {
		console.log("   ❌ Plant.id service file has wrong API key variable");
		hasErrors = true;
	}
} else {
	console.log("   ❌ services/plantId.ts not found");
	hasErrors = true;
}

// Check components/plant-result.tsx
console.log("\n3. Checking components/plant-result.tsx...");
const plantResultPath = path.join(__dirname, "components", "plant-result.tsx");
if (fs.existsSync(plantResultPath)) {
	console.log("   ✅ Plant result component exists");
} else {
	console.log("   ❌ components/plant-result.tsx not found");
	hasErrors = true;
}

// Check scan.tsx integration
console.log("\n4. Checking app/(tabs)/scan.tsx...");
const scanPath = path.join(__dirname, "app", "(tabs)", "scan.tsx");
if (fs.existsSync(scanPath)) {
	const scanContent = fs.readFileSync(scanPath, "utf8");
	if (
		scanContent.includes("identifyPlantSimple") &&
		scanContent.includes("PlantResult") &&
		scanContent.includes("analyzePlant")
	) {
		console.log("   ✅ Scan screen properly integrated");
	} else {
		console.log("   ⚠️  Scan screen may not be fully integrated");
		hasErrors = true;
	}
} else {
	console.log("   ❌ app/(tabs)/scan.tsx not found");
	hasErrors = true;
}

// Check dependencies
console.log("\n5. Checking package.json dependencies...");
const packagePath = path.join(__dirname, "package.json");
if (fs.existsSync(packagePath)) {
	const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
	const deps = packageJson.dependencies || {};

	const requiredDeps = ["expo-file-system", "expo-camera"];
	const missingDeps = requiredDeps.filter((dep) => !deps[dep]);

	if (missingDeps.length === 0) {
		console.log("   ✅ All required dependencies installed");
	} else {
		console.log(`   ❌ Missing dependencies: ${missingDeps.join(", ")}`);
		hasErrors = true;
	}
} else {
	console.log("   ❌ package.json not found");
	hasErrors = true;
}

console.log("\n" + "=".repeat(50));
if (hasErrors) {
	console.log("❌ Setup has issues. Please fix the errors above.");
	console.log("\nNext steps:");
	console.log(
		"1. Make sure .env has: EXPO_PUBLIC_PLANT_ID_KEY=your_actual_key"
	);
	console.log("2. Get your API key from: https://admin.kindwise.com/");
	console.log("3. Restart the dev server after fixing");
	process.exit(1);
} else {
	console.log("✅ All checks passed! Plant.id integration is ready.");
	console.log("\nTo test:");
	console.log("1. Make sure dev server is running: npm start");
	console.log("2. Open the Scanner tab");
	console.log("3. Take a photo of a plant");
	console.log('4. Tap "Analyze" button');
	process.exit(0);
}
