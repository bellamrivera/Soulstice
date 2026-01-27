import { FastMCP } from "fastmcp";
import { z } from "zod";
import dotenv from "dotenv";

import { birthChartInputSchema, chartSummaryInputSchema } from "./models.js";
import { calculateBirthChart, getChartSummary } from "./services/astrology_service.js";

// Load environment variables
dotenv.config();

// Create the FastMCP server
const server = new FastMCP({
  name: "Astrology MCP Server",
  version: "1.0.0",
});

// Tool: Get Birth Chart
server.addTool({
  name: "get_birth_chart",
  description: "Calculate a complete natal birth chart including planetary positions, houses, and aspects",
  parameters: birthChartInputSchema,
  execute: async (args: z.infer<typeof birthChartInputSchema>, { log }) => {
    try {
      log.info("Calculating birth chart for:", args.name);

      const chart = await calculateBirthChart({
        name: args.name,
        birth_date: args.birth_date,
        birth_time: args.birth_time,
        latitude: args.latitude,
        longitude: args.longitude,
        timezone: args.timezone,
      });

      log.debug("Birth chart calculated successfully");
      return JSON.stringify(chart, null, 2);
    } catch (error) {
      log.error("Error calculating birth chart:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  },
});

// Tool: Get Chart Summary
server.addTool({
  name: "get_chart_summary",
  description: "Get a quick summary of a birth chart including Sun, Moon, and Rising signs",
  parameters: chartSummaryInputSchema,
  execute: async (args: z.infer<typeof chartSummaryInputSchema>, { log }) => {
    try {
      log.info("Calculating chart summary");

      const summary = await getChartSummary({
        name: "User",
        birth_date: args.birth_date,
        birth_time: args.birth_time,
        latitude: args.latitude,
        longitude: args.longitude,
        timezone: args.timezone,
      });

      log.debug("Chart summary calculated successfully");
      return JSON.stringify(summary, null, 2);
    } catch (error) {
      log.error("Error calculating chart summary:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  },
});

// Start the server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3033;

server.start({
  transportType: "sse",
  sse: {
    endpoint: "/sse",
    port: port,
  },
});

console.log(`🔮 Astrology MCP Server running on port ${port}`);
console.log(`SSE endpoint: http://localhost:${port}/sse`);
