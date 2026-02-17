const fs = require("fs");
const path = require("path");

// This script generates SVG icons that you can convert to PNG using online tools
// or using a tool like sharp or imagemagick

const sizes = {
	icon: 1024, // Main app icon
	"android-icon-foreground": 1024,
	"android-icon-background": 1024,
	"android-icon-monochrome": 1024,
	favicon: 48,
	"splash-icon": 512,
};

// Modern gradient colors from your app
const gradientColors = {
	start: "#667eea",
	middle: "#764ba2",
	end: "#f093fb",
};

function generateMainIconSVG(size) {
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${gradientColors.start};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${gradientColors.middle};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${gradientColors.end};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#a8e6cf;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#56c596;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#e0f7fa;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glowGrad">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
    </radialGradient>
  </defs>
  
  <!-- Main device background with gradient -->
  <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad1)"/>
  
  <!-- Pokédex-style device design -->
  <g transform="translate(${size / 2}, ${size / 2})">
    
    <!-- Top circular lens/scanner (like Pokédex lens) -->
    <g transform="translate(0, ${-size * 0.18})">
      <!-- Outer ring -->
      <circle cx="0" cy="0" r="${size * 0.15}" fill="#ffffff" opacity="0.3"/>
      <circle cx="0" cy="0" r="${size * 0.13}" fill="url(#lensGrad)"/>
      
      <!-- Inner lens with plant silhouette -->
      <circle cx="0" cy="0" r="${size * 0.11}" fill="#56c596" opacity="0.3"/>
      
      <!-- Plant icon in lens -->
      <g opacity="0.8">
        <path d="M 0,${size * 0.05} Q 0,0 0,-${size * 0.06}" 
              stroke="#2d5f4d" 
              stroke-width="${size * 0.012}" 
              fill="none" 
              stroke-linecap="round"/>
        <path d="M 0,-${size * 0.03} Q -${size * 0.04},-${size * 0.05} -${size * 0.05},-${size * 0.03} Q -${size * 0.04},-${size * 0.01} 0,-${size * 0.03}"
              fill="#2d5f4d"/>
        <path d="M 0,0 Q ${size * 0.04},${size * 0.01} ${size * 0.05},${size * 0.03} Q ${size * 0.04},${size * 0.05} 0,0"
              fill="#2d5f4d"/>
      </g>
      
      <!-- Lens highlight -->
      <ellipse cx="${-size * 0.04}" cy="${-size * 0.04}" rx="${size * 0.03}" ry="${size * 0.025}" 
               fill="url(#glowGrad)"/>
    </g>
    
    <!-- Screen/Display area -->
    <rect x="${-size * 0.25}" y="${size * 0.05}" 
          width="${size * 0.5}" height="${size * 0.18}" 
          rx="${size * 0.02}" 
          fill="url(#screenGrad)" 
          opacity="0.9"/>
    
    <!-- Screen border/frame -->
    <rect x="${-size * 0.25}" y="${size * 0.05}" 
          width="${size * 0.5}" height="${size * 0.18}" 
          rx="${size * 0.02}" 
          fill="none"
          stroke="#ffffff" 
          stroke-width="${size * 0.008}"/>
    
    <!-- Screen text lines (data display) -->
    <line x1="${-size * 0.22}" y1="${size * 0.09}" x2="${size * 0.1}" y2="${size * 0.09}" 
          stroke="#2d5f4d" stroke-width="${size * 0.006}" opacity="0.5"/>
    <line x1="${-size * 0.22}" y1="${size * 0.14}" x2="${size * 0.15}" y2="${size * 0.14}" 
          stroke="#2d5f4d" stroke-width="${size * 0.006}" opacity="0.5"/>
    <line x1="${-size * 0.22}" y1="${size * 0.19}" x2="${size * 0.08}" y2="${size * 0.19}" 
          stroke="#2d5f4d" stroke-width="${size * 0.006}" opacity="0.5"/>
    
    <!-- Control buttons (Pokédex-style) -->
    <!-- Large center button -->
    <circle cx="0" cy="${size * 0.32}" r="${size * 0.055}" 
            fill="#ffffff" opacity="0.9"/>
    <circle cx="0" cy="${size * 0.32}" r="${size * 0.045}" 
            fill="#a8e6cf"/>
    
    <!-- Small side buttons -->
    <circle cx="${-size * 0.12}" cy="${size * 0.32}" r="${size * 0.03}" 
            fill="#ffffff" opacity="0.7"/>
    <circle cx="${size * 0.12}" cy="${size * 0.32}" r="${size * 0.03}" 
            fill="#ffffff" opacity="0.7"/>
    
    <!-- Indicator lights (top right) -->
    <circle cx="${size * 0.28}" cy="${-size * 0.35}" r="${size * 0.018}" 
            fill="#ff6b6b" opacity="0.8"/>
    <circle cx="${size * 0.35}" cy="${-size * 0.35}" r="${size * 0.018}" 
            fill="#4ecdc4" opacity="0.8"/>
    
  </g>
</svg>`;
}

function generateAndroidForegroundSVG(size) {
	// Android adaptive icon foreground (should be centered, no background)
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#a8e6cf;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#56c596;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#e0f7fa;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Pokédex-style device design -->
  <g transform="translate(${size / 2}, ${size / 2})">
    
    <!-- Top circular lens/scanner -->
    <g transform="translate(0, ${-size * 0.18})">
      <circle cx="0" cy="0" r="${size * 0.15}" fill="#ffffff" opacity="0.3"/>
      <circle cx="0" cy="0" r="${size * 0.13}" fill="url(#lensGrad)"/>
      <circle cx="0" cy="0" r="${size * 0.11}" fill="#56c596" opacity="0.3"/>
      
      <g opacity="0.8">
        <path d="M 0,${size * 0.05} Q 0,0 0,-${size * 0.06}" 
              stroke="#2d5f4d" stroke-width="${size * 0.012}" fill="none" stroke-linecap="round"/>
        <path d="M 0,-${size * 0.03} Q -${size * 0.04},-${size * 0.05} -${size * 0.05},-${size * 0.03} Q -${size * 0.04},-${size * 0.01} 0,-${size * 0.03}"
              fill="#2d5f4d"/>
        <path d="M 0,0 Q ${size * 0.04},${size * 0.01} ${size * 0.05},${size * 0.03} Q ${size * 0.04},${size * 0.05} 0,0"
              fill="#2d5f4d"/>
      </g>
    </g>
    
    <!-- Screen area -->
    <rect x="${-size * 0.25}" y="${size * 0.05}" width="${size * 0.5}" height="${size * 0.18}" 
          rx="${size * 0.02}" fill="url(#screenGrad)" opacity="0.9"/>
    <rect x="${-size * 0.25}" y="${size * 0.05}" width="${size * 0.5}" height="${size * 0.18}" 
          rx="${size * 0.02}" fill="none" stroke="#ffffff" stroke-width="${size * 0.008}"/>
    
    <!-- Buttons -->
    <circle cx="0" cy="${size * 0.32}" r="${size * 0.055}" fill="#ffffff" opacity="0.9"/>
    <circle cx="0" cy="${size * 0.32}" r="${size * 0.045}" fill="#a8e6cf"/>
    <circle cx="${-size * 0.12}" cy="${size * 0.32}" r="${size * 0.03}" fill="#ffffff" opacity="0.7"/>
    <circle cx="${size * 0.12}" cy="${size * 0.32}" r="${size * 0.03}" fill="#ffffff" opacity="0.7"/>
    
  </g>
</svg>`;
}

function generateAndroidBackgroundSVG(size) {
	// Simple gradient background for Android adaptive icon
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${gradientColors.start};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${gradientColors.middle};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${gradientColors.end};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#bgGrad)"/>
</svg>`;
}

function generateMonochromeSVG(size) {
	// Monochrome version for Android themed icons (Pokédex style)
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(${size / 2}, ${size / 2})">
    <!-- Circular lens -->
    <circle cx="0" cy="${-size * 0.18}" r="${size * 0.13}" fill="none" stroke="#ffffff" stroke-width="${size * 0.015}"/>
    <circle cx="0" cy="${-size * 0.18}" r="${size * 0.08}" fill="#ffffff" opacity="0.3"/>
    
    <!-- Plant in lens -->
    <path d="M 0,${-size * 0.13} Q 0,${-size * 0.18} 0,-${size * 0.24}" 
          stroke="#ffffff" stroke-width="${size * 0.012}" fill="none" stroke-linecap="round"/>
    <path d="M 0,-${size * 0.21} Q -${size * 0.04},-${size * 0.23} -${size * 0.05},-${size * 0.21} Q -${size * 0.04},-${size * 0.19} 0,-${size * 0.21}"
          fill="#ffffff"/>
    <path d="M 0,-${size * 0.18} Q ${size * 0.04},-${size * 0.17} ${size * 0.05},-${size * 0.15} Q ${size * 0.04},-${size * 0.13} 0,-${size * 0.18}"
          fill="#ffffff"/>
    
    <!-- Screen -->
    <rect x="${-size * 0.2}" y="${size * 0.05}" width="${size * 0.4}" height="${size * 0.15}" 
          rx="${size * 0.015}" fill="none" stroke="#ffffff" stroke-width="${size * 0.01}"/>
    
    <!-- Buttons -->
    <circle cx="0" cy="${size * 0.32}" r="${size * 0.05}" fill="none" stroke="#ffffff" stroke-width="${size * 0.01}"/>
    <circle cx="${-size * 0.1}" cy="${size * 0.32}" r="${size * 0.025}" fill="#ffffff"/>
    <circle cx="${size * 0.1}" cy="${size * 0.32}" r="${size * 0.025}" fill="#ffffff"/>
  </g>
</svg>`;
}

function generateFaviconSVG(size) {
	// Simplified Pokédex version for favicon
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${gradientColors.start};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${gradientColors.end};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <g transform="translate(${size / 2}, ${size / 2})">
    <!-- Lens -->
    <circle cx="0" cy="${-size * 0.15}" r="${size * 0.12}" fill="#ffffff" opacity="0.9"/>
    <circle cx="0" cy="${-size * 0.15}" r="${size * 0.08}" fill="#56c596" opacity="0.5"/>
    
    <!-- Screen -->
    <rect x="${-size * 0.18}" y="${size * 0.05}" width="${size * 0.36}" height="${size * 0.12}" 
          rx="${size * 0.02}" fill="#a8e6cf" opacity="0.8"/>
    
    <!-- Button -->
    <circle cx="0" cy="${size * 0.28}" r="${size * 0.06}" fill="#ffffff" opacity="0.9"/>
  </g>
</svg>`;
}

// Create output directory
const outputDir = path.join(__dirname, "..", "assets", "generated-icons");
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all SVG files
const svgFiles = {
	"icon.svg": generateMainIconSVG(sizes.icon),
	"android-icon-foreground.svg": generateAndroidForegroundSVG(
		sizes["android-icon-foreground"]
	),
	"android-icon-background.svg": generateAndroidBackgroundSVG(
		sizes["android-icon-background"]
	),
	"android-icon-monochrome.svg": generateMonochromeSVG(
		sizes["android-icon-monochrome"]
	),
	"favicon.svg": generateFaviconSVG(sizes.favicon),
	"splash-icon.svg": generateAndroidForegroundSVG(sizes["splash-icon"]),
};

Object.entries(svgFiles).forEach(([filename, content]) => {
	const filepath = path.join(outputDir, filename);
	fs.writeFileSync(filepath, content);
	console.log(`✓ Generated ${filename}`);
});

console.log("\n✨ SVG icons generated successfully!");
console.log("\n📝 Next steps:");
console.log("1. Open the SVG files in assets/generated-icons/");
console.log("2. Convert them to PNG using one of these methods:");
console.log("   - Online: https://cloudconvert.com/svg-to-png");
console.log(
	"   - CLI: npm install -g sharp-cli && sharp input.svg -o output.png"
);
console.log("   - Inkscape, GIMP, or any vector graphics tool");
console.log(
	"3. Replace the PNG files in assets/images/ with the converted files"
);
console.log("4. Run: npx expo prebuild --clean");
console.log("5. Rebuild your app!");
