import xlsx from "xlsx";
import fs from "fs";

const inputPath  = "C:/Users/Public/Documents/Web Design/past-deliveries.xlsx";
const sheetName  = "Sheet1";
const outputPath = "./data/past-deliveries.json";

console.log(`📖 Reading ${inputPath} …`);
const workbook = xlsx.readFile(inputPath);
const sheet = workbook.Sheets[sheetName];
if (!sheet) throw new Error(`Worksheet '${sheetName}' not found.`);

let rows = xlsx.utils.sheet_to_json(sheet, { defval: "", raw: true });

// 🔧 Force every value to a string (preserves leading zeros and quotes)
rows = rows.map(obj => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = (v === null || v === undefined) ? "" : String(v);
  }
  return out;
});

fs.mkdirSync("./data", { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), "utf8");
console.log(`✅ Wrote ${outputPath} with ${rows.length} records (stringified values).`);
