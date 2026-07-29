import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/suggestion-system";

async function clearSuggestions() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Delete all suggestions
    const suggResult = await mongoose.connection.collection("suggestions").deleteMany({});
    console.log(`Deleted ${suggResult.deletedCount} suggestions.`);

    // Delete all point logs (just in case there are any left)
    const logResult = await mongoose.connection.collection("pointlogs").deleteMany({});
    console.log(`Deleted ${logResult.deletedCount} point logs.`);

    // Reset User personalPoints to 0
    const userResult = await mongoose.connection.collection("users").updateMany(
      {},
      { $set: { personalPoints: 0 } }
    );
    console.log(`Updated ${userResult.modifiedCount} users to 0 points.`);

    // Reset Department totalPoints to 0
    const deptResult = await mongoose.connection.collection("departments").updateMany(
      {},
      { $set: { totalPoints: 0 } }
    );
    console.log(`Updated ${deptResult.modifiedCount} departments to 0 points.`);

    console.log("Successfully cleared suggestions and reset points!");
  } catch (error) {
    console.error("Error clearing data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

clearSuggestions();
