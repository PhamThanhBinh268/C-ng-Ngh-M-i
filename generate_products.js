const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'data.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Fix broken images
content = content.replace(/1608338782410-b99813e3bdf8/g, '1502086223501-7ea6ecd79368');

// The working images we have
const workingImages = [
  "1596461404969-9ae70f2830c1",
  "1587654780291-39c9404d746b",
  "1555448248-2571daf6344b",
  "1513364776144-60967b0f800f",
  "1559454403-b8fb88521f11",
  "1515488042361-ee00e0ddd4e4",
  "1599623560574-39d485900c95",
  "1580541832626-2a7131ee809f",
  "1594787318286-3d835c1d207f",
  "1502086223501-7ea6ecd79368",
  "1591994843349-f415893b3a6b"
];

const categories = [
  { id: "1", name: "Đồ chơi giáo dục" },
  { id: "2", name: "LEGO & Lắp ráp" },
  { id: "3", name: "Mô hình & Búp bê" },
  { id: "4", name: "Đồ chơi vận động" },
  { id: "5", name: "Đồ chơi nghệ thuật" },
  { id: "6", name: "Gấu bông" }
];

const ages = ["0-3 tuổi", "3-5 tuổi", "4-7 tuổi", "6-12 tuổi", "8-12 tuổi", "Trên 12 tuổi", "Mọi lứa tuổi"];

const newProducts = [];
let currentId = 21;

const prefixes = ["Bộ", "Mô hình", "Xe", "Đàn", "Thú nhồi bông", "Bộ cờ", "Lều", "Đồ chơi", "Gấu", "Khối"];
const adjectives = ["Siêu Cấp", "Thông Minh", "Cao Cấp", "Đáng Yêu", "Sáng Tạo", "Mini", "Khổng Lồ", "Phát Sáng", "Đa Năng"];

for (let i = 0; i < 30; i++) {
  const cat = categories[Math.floor(Math.random() * categories.length)];
  const age = ages[Math.floor(Math.random() * ages.length)];
  const imgId = workingImages[Math.floor(Math.random() * workingImages.length)];
  const isNew = Math.random() > 0.5;
  const isSale = Math.random() > 0.5;
  
  const originalPrice = Math.floor(Math.random() * 15 + 5) * 50000; // 250k - 1000k
  const price = isSale ? originalPrice * (1 - Math.floor(Math.random() * 3 + 1) * 0.1) : originalPrice; // 10% - 30% off

  const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${cat.name.split(' ')[2] || 'Đồ chơi'} ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${currentId}`;

  newProducts.push({
    id: `p${currentId}`,
    name,
    price,
    originalPrice,
    image_url: `https://images.unsplash.com/photo-${imgId}?w=800`,
    rating: (Math.random() * 1 + 4).toFixed(1), // 4.0 - 5.0
    reviews: Math.floor(Math.random() * 500 + 10),
    category: cat.name,
    categoryId: cat.id,
    brand: "ToyBrands",
    age: age,
    stock: Math.floor(Math.random() * 100 + 10),
    isNew,
    isSale,
    description: `Sản phẩm ${name} mang lại niềm vui bất tận cho bé. Thiết kế an toàn, chất liệu cao cấp.`
  });
  
  currentId++;
}

const productsJson = JSON.stringify(newProducts, null, 2).slice(1, -1); // remove outer []

// We need to inject this into PRODUCTS array in data.ts
// Find the last product in PRODUCTS
const splitIndex = content.lastIndexOf('];\nexport const BANNERS');

if (splitIndex !== -1) {
  const newContent = content.slice(0, splitIndex) + ',\n' + productsJson + '\n' + content.slice(splitIndex);
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log("Success");
} else {
  // Try another approach
  const endOfProducts = content.indexOf('];\n\nexport const BANNERS') !== -1 ? content.indexOf('];\n\nexport const BANNERS') : content.indexOf('];\r\nexport const BANNERS');
  if (endOfProducts !== -1) {
      const newContent = content.slice(0, endOfProducts) + ',\n' + productsJson + '\n' + content.slice(endOfProducts);
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log("Success");
  } else {
      console.log("Could not find insertion point.");
  }
}
