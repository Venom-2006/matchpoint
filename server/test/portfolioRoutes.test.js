
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Portfolio routes", () => {
  it("rejects requests without an authentication token", async () => {
    const response = await request(app).get("/api/portfolio");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("rejects requests with an invalid authentication token", async () => {
    const response = await request(app)
      .get("/api/portfolio")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
