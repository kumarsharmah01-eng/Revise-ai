import "dotenv/config";

const key = process.env.GEMINI_API_KEY;

console.log("Key exists:", !!key);
console.log("Key length:", key?.length);
console.log("Key starts with:", key?.substring(0, 4));
console.log("Key ends with:", key?.slice(-4));
