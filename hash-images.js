const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Change this to the folder where your images are
const IMAGE_DIR = path.join(__dirname, "assets");
const HASH_FILE = path.join(__dirname, "image-hashes.json");

// Get list of all image files (.jpg and .png)
function getAllImageFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllImageFiles(filePath));
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      results.push(filePath);
    }
  });
  return results;
}

// Generate a content-based hash
function getFileHash(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(data).digest("hex").slice(0, 8); // short hash
}

// Load or initialize previous hashes
let prevHashes = {};
if (fs.existsSync(HASH_FILE)) {
  prevHashes = JSON.parse(fs.readFileSync(HASH_FILE, "utf8"));
}

// Process files
const imageFiles = getAllImageFiles(IMAGE_DIR);
const newHashes = {};
const changed = [];

imageFiles.forEach(filePath => {
  const hash = getFileHash(filePath);
  const relPath = path.relative(IMAGE_DIR, filePath).replace(/\\/g, "/"); // normalize for Windows
  newHashes[relPath] = hash;
  if (prevHashes[relPath] !== hash) {
    changed.push(relPath);
  }
});

// Save updated hashes
fs.writeFileSync(HASH_FILE, JSON.stringify(newHashes, null, 2));

// Output changed files
if (changed.length > 0) {
  console.log("Changed image files:");
  changed.forEach(file => {
    console.log(`${file}?v=${newHashes[file]}`);
  });
} else {
  console.log("No image changes detected.");
}
