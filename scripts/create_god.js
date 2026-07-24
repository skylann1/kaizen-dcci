const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8').split('\n');
  envConfig.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

async function createGodAccount() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    const db = mongoose.connection.db;

    // 1. Create God Role
    const rolesCollection = db.collection("roles");
    let godRole = await rolesCollection.findOne({ name: "God" });

    if (!godRole) {
      console.log("Creating 'God' role...");
      const result = await rolesCollection.insertOne({
        name: "God",
        tag: "SYSTEM",
        description: "Akun tertinggi yang tidak terlihat oleh siapa pun",
        permissions: {
          canViewDashboard: true,
          canViewSuggestions: true,
          canCreateSuggestions: true,
          canManageSuggestions: true,
          canDeleteSuggestions: true,
          canManageSystem: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      godRole = await rolesCollection.findOne({ _id: result.insertedId });
      console.log("'God' role created.");
    } else {
      console.log("'God' role already exists.");
    }

    // 2. Create God Department (if needed, or just dummy)
    const deptCollection = db.collection("departments");
    let godDept = await deptCollection.findOne({ name: "System Admin" });
    if (!godDept) {
      console.log("Creating 'System Admin' department...");
      const result = await deptCollection.insertOne({
        name: "System Admin",
        description: "God Tier",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      godDept = await deptCollection.findOne({ _id: result.insertedId });
    }

    // 3. Create God User
    const usersCollection = db.collection("users");
    let godUser = await usersCollection.findOne({ nik: "GOD123" });

    if (!godUser) {
      console.log("Creating God user...");
      const hashedPassword = await bcrypt.hash("god123", 10);
      await usersCollection.insertOne({
        name: "The Creator",
        email: "god@dcci.com",
        nik: "GOD123",
        password: hashedPassword,
        role: godRole._id,
        department: godDept._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("God user created successfully!");
    } else {
      console.log("God user already exists!");
    }

    console.log("\n==================================");
    console.log("God Account Details:");
    console.log("NIK: GOD123");
    console.log("Password: god123");
    console.log("==================================\n");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

createGodAccount();
