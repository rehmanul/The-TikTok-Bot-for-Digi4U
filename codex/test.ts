import runBot from "../src/bot/index.ts"; // adjust the path

(async () => {
  try {
    await runBot(); // this should run your full invitation logic
    console.log("✅ Bot execution finished.");
  } catch (err) {
    console.error("❌ Bot error:", err);
    process.exit(1);
  }
})();
