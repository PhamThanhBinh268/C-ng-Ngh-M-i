const fs = require('fs');
const path = require('path');
const google = require('googlethis');

const filePath = path.join(__dirname, 'src', 'lib', 'data.ts');
let content = fs.readFileSync(filePath, 'utf-8');

let jsContent = content.replace(/export const/g, 'const');
jsContent += '\nmodule.exports = { PRODUCTS, CATEGORIES, BANNERS };';
fs.writeFileSync(path.join(__dirname, 'temp_data.js'), jsContent, 'utf-8');
const { PRODUCTS, CATEGORIES, BANNERS } = require('./temp_data.js');

async function processProducts() {
    console.log("Fetching images...");
    for (let i = 0; i < PRODUCTS.length; i++) {
        const p = PRODUCTS[i];
        try {
            // Add 'đồ chơi' to context if not present, to get better images
            const query = p.name.toLowerCase().includes('đồ chơi') ? p.name : `đồ chơi ${p.name}`;
            const images = await google.image(query, { safe: false });
            if (images && images.length > 0) {
                // Find a decent image (preferably square-ish or just the first one that is a standard URL)
                const validImg = images.find(img => img.url.startsWith('http') && !img.url.includes('fbsbx') && !img.url.includes('lookaside'));
                if (validImg) {
                    p.image_url = validImg.url;
                    console.log(`[${i+1}/${PRODUCTS.length}] Found image for ${p.name}`);
                } else {
                    console.log(`[${i+1}/${PRODUCTS.length}] No valid image URL for ${p.name}`);
                }
            } else {
                console.log(`[${i+1}/${PRODUCTS.length}] No images for ${p.name}`);
            }
        } catch (e) {
            console.log(`[${i+1}/${PRODUCTS.length}] Error fetching for ${p.name}: ${e.message}`);
        }
        // sleep a bit to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    const newContent = `export const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};

export const PRODUCTS = ${JSON.stringify(PRODUCTS, null, 2)};

export const BANNERS = ${JSON.stringify(BANNERS, null, 2)};
`;

    fs.writeFileSync(filePath, newContent, 'utf-8');
    fs.unlinkSync(path.join(__dirname, 'temp_data.js'));
    console.log("Done updating images!");
}

processProducts();
