
import { describe, it, expect } from "vitest";
import { registerUser } from "../src/services/authService.js";

describe("Authentication input validation", () => {
  it("rejects a missing username", async () => {
    await expect(
      registerUser({
        username: "",
        email: "test@example.com",
        password: "StrongPassword123!",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects an invalid email", async () => {
    await expect(
      registerUser({
        username: "test_user",
        email: "not-an-email",
        password: "StrongPassword123!",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects a short password", async () => {
    await expect(
      registerUser({
        username: "test_user",
        email: "test@example.com",
        password: "short",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects a username containing spaces", async () => {
    await expect(
      registerUser({
        username: "test user",
        email: "test@example.com",
        password: "StrongPassword123!",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects a password longer than 72 UTF-8 bytes", async () => {
  await expect(
    registerUser({
      username: "test_user",
      email: "test@example.com",
      password: "a".repeat(73),
    })
  ).rejects.toMatchObject({ statusCode: 400 });
});

it("rejects a username longer than 24 characters", async () => {
  await expect(
    registerUser({
      username: "a".repeat(25),
      email: "test@example.com",
      password: "StrongPassword123!",
    })
  ).rejects.toMatchObject({ statusCode: 400 });
});

it("rejects a missing password", async () => {
  await expect(
    registerUser({
      username: "test_user",
      email: "test@example.com",
      password: "",
    })
  ).rejects.toMatchObject({ statusCode: 400 });
});
});
