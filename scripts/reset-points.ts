import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/suggestion-system";

async function resetPoints() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    // 1. Reset User personalPoints to 0
    const userResult = await mongoose.connection.collection("users").updateMany(
      {},
      { $set: { personalPoints: 0 } }
    );
    console.log(`Updated ${userResult.modifiedCount} users.`);

    // 2. Reset Department totalPoints to 0
    const deptResult = await mongoose.connection.collection("departments").updateMany(
      {},
      { $set: { totalPoints: 0 } }
    );
    console.log(`Updated ${deptResult.modifiedCount} departments.`);

    // 3. Reset Suggestion pointsAwarded to 0
    const suggResult = await mongoose.connection.collection("suggestions").updateMany(
      {},
      { $set: { pointsAwarded: 0 } }
    );
    console.log(`Updated ${suggResult.modifiedCount} suggestions.`);

    // 4. Delete all PointLog entries
    const logResult = await mongoose.connection.collection("pointlogs").deleteMany({});
    console.log(`Deleted ${logResult.deletedCount} point logs.`);

    console.log("Successfully reset all points!");
  } catch (error) {
    console.error("Error resetting points:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

resetPoints();
