/**
 * Quick test script to verify the Astrology MCP server works
 */
import { calculateBirthChart } from "./src/services/astrology_service.js";
async function test() {
    console.log("Testing Astrology MCP Server...\n");
    try {
        // Test with a real birth chart
        const chart = await calculateBirthChart({
            name: "Bella",
            birth_date: "1995-03-15",
            birth_time: "14:30",
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: "America/New_York",
        });
        console.log("✅ Birth Chart calculated successfully!\n");
        console.log("Name:", chart.name);
        console.log("Birth Date:", chart.birth_data.date);
        console.log("Birth Time:", chart.birth_data.time);
        console.log("Rising Sign:", chart.rising_sign);
        console.log("\nPlanetary Positions:");
        Object.entries(chart.planets).forEach(([planet, data]) => {
            console.log(`  ${planet}: ${data.sign} (${data.position.toFixed(2)}°) in ${data.house}${data.retrograde ? " ℞" : ""}`);
        });
        console.log("\n🎉 Test passed!");
    }
    catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }
}
test();
