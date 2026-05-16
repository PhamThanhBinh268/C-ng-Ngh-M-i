const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'data.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// We will parse the file, update the PRODUCTS array, and write it back.
// Since data.ts has CATEGORIES, PRODUCTS, BANNERS, we can extract PRODUCTS with regex.

// A safer way: just use a replacer on the raw string for image_url inside the PRODUCTS array.
// But we want to map based on category.

// Let's execute the data.ts to get the array, then regenerate the text. 
// Since it's TS with no complex types in the arrays, we can evaluate it if we strip exports.
let jsContent = content.replace(/export const/g, 'const');
jsContent += '\nmodule.exports = { PRODUCTS, CATEGORIES, BANNERS };';

fs.writeFileSync(path.join(__dirname, 'temp_data.js'), jsContent, 'utf-8');
const { PRODUCTS, CATEGORIES, BANNERS } = require('./temp_data.js');

const getKeyword = (catName) => {
    if (catName.includes('giáo dục')) return 'education,toy';
    if (catName.includes('LEGO')) return 'lego';
    if (catName.includes('Mô hình')) return 'doll';
    if (catName.includes('vận động')) return 'playground';
    if (catName.includes('nghệ thuật')) return 'craft,toy';
    if (catName.includes('Gấu bông')) return 'teddybear';
    return 'toy';
};

PRODUCTS.forEach((p, idx) => {
    const keyword = getKeyword(p.category);
    p.image_url = `https://loremflickr.com/800/800/${keyword}?lock=${idx + 1}`;
});

// Now reconstruct the file
const newContent = `export const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};

export const PRODUCTS = ${JSON.stringify(PRODUCTS, null, 2)};

export const BANNERS = ${JSON.stringify(BANNERS, null, 2)};
`;

fs.writeFileSync(filePath, newContent, 'utf-8');
fs.unlinkSync(path.join(__dirname, 'temp_data.js'));
console.log("Images updated successfully!");
