
import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../src/app.js";

describe("Health API", () => {
  it("returns a successful live status", async () => {
    const response = await request(app)
      .get("/api/health/live");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe("alive");
  });

  it("returns JSON for unknown routes", async () => {
    const response = await request(app)
      .get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
