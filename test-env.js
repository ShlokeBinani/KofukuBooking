import dotenv from "dotenv";

console.log("🔧 Testing environment variable loading...");

// Load .env file
const result = dotenv.config();

if (result.error) {
  console.error("❌ Error loading .env file:", result.error);
} else {
  console.log("✅ .env file loaded successfully");
}

console.log("\n📋 Environment variables:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "✅ Set" : "❌ Not set");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);

if (!process.env.DATABASE_URL) {
  console.log("\n❌ DATABASE_URL is missing!");
  console.log("📝 Create a .env file with:");
  console.log("DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/room_booking_db");
}

console.log("\n📁 Current directory:", process.cwd());
console.log("📄 .env file path should be:", process.cwd() + "\\.env");