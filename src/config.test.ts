import { API_BASE_URL } from "./config";
import { describe, it, expect } from 'vitest';

describe('config', () => {
  it("should have a valid API_BASE_URL", () => {
    expect(API_BASE_URL).toBe("http://localhost:8000/api");
  });
});
