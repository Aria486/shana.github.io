import {
  getRandomRgbColor,
  cubicBezier,
  quadraticBezier,
  linearInterpolation,
  clamp,
  extractSubcategories,
} from "./helper";
import { DirectoryNode } from "@/interface";

describe("helper functions", () => {
  describe("getRandomRgbColor", () => {
    it("returns a valid RGB color string", () => {
      const color = getRandomRgbColor();
      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it("returns RGB values between 0 and 255", () => {
      const color = getRandomRgbColor();
      const matches = color.match(/rgb\((\d+), (\d+), (\d+)\)/);

      expect(matches).not.toBeNull();
      if (matches) {
        const [, r, g, b] = matches;
        expect(parseInt(r)).toBeGreaterThanOrEqual(0);
        expect(parseInt(r)).toBeLessThanOrEqual(255);
        expect(parseInt(g)).toBeGreaterThanOrEqual(0);
        expect(parseInt(g)).toBeLessThanOrEqual(255);
        expect(parseInt(b)).toBeGreaterThanOrEqual(0);
        expect(parseInt(b)).toBeLessThanOrEqual(255);
      }
    });

    it("returns different colors on multiple calls", () => {
      const colors = new Set();
      for (let i = 0; i < 10; i++) {
        colors.add(getRandomRgbColor());
      }
      // It's very unlikely (but possible) that all 10 calls return the same color
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  describe("cubicBezier", () => {
    it("returns p0 when t = 0", () => {
      const result = cubicBezier(0, 10, 20, 30, 40);
      expect(result).toBe(10);
    });

    it("returns p3 when t = 1", () => {
      const result = cubicBezier(1, 10, 20, 30, 40);
      expect(result).toBe(40);
    });

    it("returns interpolated value for t = 0.5", () => {
      const result = cubicBezier(0.5, 0, 0, 100, 100);
      expect(result).toBe(50);
    });

    it("handles negative values correctly", () => {
      const result = cubicBezier(0.5, -10, -5, 5, 10);
      expect(result).toBe(0);
    });

    it("calculates correct values for known bezier curve", () => {
      // Test with a simple curve
      const result = cubicBezier(0.25, 0, 25, 50, 100);
      expect(result).toBeCloseTo(19.140625, 5);
    });
  });

  describe("quadraticBezier", () => {
    it("returns p0 when t = 0", () => {
      const result = quadraticBezier(0, 10, 20, 30);
      expect(result).toBe(10);
    });

    it("returns p2 when t = 1", () => {
      const result = quadraticBezier(1, 10, 20, 30);
      expect(result).toBe(30);
    });

    it("returns interpolated value for t = 0.5", () => {
      const result = quadraticBezier(0.5, 0, 50, 100);
      expect(result).toBe(50);
    });

    it("handles negative values correctly", () => {
      const result = quadraticBezier(0.5, -10, 0, 10);
      expect(result).toBe(0);
    });

    it("calculates correct values for parabolic curve", () => {
      const result = quadraticBezier(0.25, 0, 0, 100);
      expect(result).toBeCloseTo(6.25, 5);
    });
  });

  describe("linearInterpolation", () => {
    it("returns p0 when t = 0", () => {
      const result = linearInterpolation(0, 10, 20);
      expect(result).toBe(10);
    });

    it("returns p1 when t = 1", () => {
      const result = linearInterpolation(1, 10, 20);
      expect(result).toBe(20);
    });

    it("returns midpoint when t = 0.5", () => {
      const result = linearInterpolation(0.5, 10, 20);
      expect(result).toBe(15);
    });

    it("handles negative values correctly", () => {
      const result = linearInterpolation(0.5, -10, 10);
      expect(result).toBe(0);
    });

    it("works with decimal values", () => {
      const result = linearInterpolation(0.25, 0, 100);
      expect(result).toBe(25);
    });

    it("extrapolates beyond range when t > 1", () => {
      const result = linearInterpolation(1.5, 0, 10);
      expect(result).toBe(15);
    });

    it("extrapolates beyond range when t < 0", () => {
      const result = linearInterpolation(-0.5, 0, 10);
      expect(result).toBe(-5);
    });
  });

  describe("clamp", () => {
    it("returns value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it("returns min when value is below range", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-100, -50, 50)).toBe(-50);
    });

    it("returns max when value is above range", () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(100, -50, 50)).toBe(50);
    });

    it("handles negative ranges correctly", () => {
      expect(clamp(-25, -30, -20)).toBe(-25);
      expect(clamp(-35, -30, -20)).toBe(-30);
      expect(clamp(-15, -30, -20)).toBe(-20);
    });

    it("handles decimal values correctly", () => {
      expect(clamp(5.5, 0, 10)).toBe(5.5);
      expect(clamp(-0.5, 0, 10)).toBe(0);
      expect(clamp(10.5, 0, 10)).toBe(10);
    });

    it("handles edge case where min equals max", () => {
      expect(clamp(5, 10, 10)).toBe(10);
      expect(clamp(15, 10, 10)).toBe(10);
      expect(clamp(10, 10, 10)).toBe(10);
    });
  });

  describe("extractSubcategories", () => {
    it("extracts subcategories from a category with subdirectories", () => {
      const mockData: DirectoryNode[] = [
        {
          name: "program",
          type: "directory",
          children: [
            { name: "css", type: "directory", children: [] },
            { name: "javascript", type: "directory", children: [] },
            { name: "react", type: "directory", children: [] },
            { name: "readme.md", type: "file" },
          ],
        },
      ];

      const result = extractSubcategories("program", mockData);
      expect(result).toEqual(["css", "javascript", "react"]);
    });

    it("returns empty array when category has no subdirectories", () => {
      const mockData: DirectoryNode[] = [
        {
          name: "history",
          type: "directory",
          children: [
            { name: "template.md", type: "file" },
            { name: "readme.md", type: "file" },
          ],
        },
      ];

      const result = extractSubcategories("history", mockData);
      expect(result).toEqual([]);
    });

    it("returns empty array when category does not exist", () => {
      const mockData: DirectoryNode[] = [
        {
          name: "program",
          type: "directory",
          children: [{ name: "css", type: "directory", children: [] }],
        },
      ];

      const result = extractSubcategories("nonexistent", mockData);
      expect(result).toEqual([]);
    });

    it("returns empty array when category has no children", () => {
      const mockData: DirectoryNode[] = [
        {
          name: "empty",
          type: "directory",
        },
      ];

      const result = extractSubcategories("empty", mockData);
      expect(result).toEqual([]);
    });

    it("returns empty array when directoryData is empty", () => {
      const result = extractSubcategories("program", []);
      expect(result).toEqual([]);
    });

    it("sorts subcategories alphabetically", () => {
      const mockData: DirectoryNode[] = [
        {
          name: "program",
          type: "directory",
          children: [
            { name: "react", type: "directory", children: [] },
            { name: "css", type: "directory", children: [] },
            { name: "javascript", type: "directory", children: [] },
            { name: "python", type: "directory", children: [] },
          ],
        },
      ];

      const result = extractSubcategories("program", mockData);
      expect(result).toEqual(["css", "javascript", "python", "react"]);
    });

    it("handles Chinese characters in subcategory names", () => {
      const mockData: DirectoryNode[] = [
        {
          name: "study_note",
          type: "directory",
          children: [
            { name: "机器学习", type: "directory", children: [] },
            { name: "LLM", type: "directory", children: [] },
            { name: "安全", type: "directory", children: [] },
          ],
        },
      ];

      const result = extractSubcategories("study_note", mockData);
      expect(result.length).toBe(3);
      expect(result).toContain("LLM");
      expect(result).toContain("机器学习");
      expect(result).toContain("安全");
    });

    it("filters out files and keeps only directories", () => {
      const mockData: DirectoryNode[] = [
        {
          name: "program",
          type: "directory",
          children: [
            { name: "css", type: "directory", children: [] },
            { name: "readme.md", type: "file" },
            { name: "javascript", type: "directory", children: [] },
            { name: "index.html", type: "file" },
            { name: "react", type: "directory", children: [] },
          ],
        },
      ];

      const result = extractSubcategories("program", mockData);
      expect(result).toEqual(["css", "javascript", "react"]);
      expect(result).not.toContain("readme.md");
      expect(result).not.toContain("index.html");
    });
  });
});
