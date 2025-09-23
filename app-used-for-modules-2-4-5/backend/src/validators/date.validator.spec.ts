import type { ValidationArguments } from "class-validator";

import { NiceDateConstraint } from "./date.validator";

describe("NiceDateConstraint", () => {
  let constraint: NiceDateConstraint;

  beforeEach(() => {
    constraint = new NiceDateConstraint();
  });

  describe("validate", () => {
    it("should return true when current date is after related date", () => {
      const mockArguments: ValidationArguments = {
        value: "2025-12-01",
        constraints: ["startDate"],
        targetName: "TestClass",
        object: {
          startDate: "2025-11-01",
          endDate: "2025-12-01",
        },
        property: "endDate",
      };
      const result = constraint.validate("2025-12-01", mockArguments);
      expect(result).toBe(true);
    });

    it("should return false when current date is before related date", () => {
      const mockArguments: ValidationArguments = {
        value: "2025-10-01",
        constraints: ["startDate"],
        targetName: "TestClass",
        object: {
          startDate: "2025-11-01",
          endDate: "2025-10-01",
        },
        property: "endDate",
      };
      const result = constraint.validate("2025-10-01", mockArguments);
      expect(result).toBe(false);
    });

    it("should return false when value is not a string or Date", () => {
      const mockArguments: ValidationArguments = {
        value: 123,
        constraints: ["startDate"],
        targetName: "TestClass",
        object: {
          startDate: "2025-11-01",
        },
        property: "endDate",
      };
      const result = constraint.validate(123, mockArguments);
      expect(result).toBe(false);
    });

    it("should return false when dates are invalid", () => {
      const mockArguments: ValidationArguments = {
        value: "invalid-date",
        constraints: ["startDate"],
        targetName: "TestClass",
        object: {
          startDate: "nieprawidlowa-data",
        },
        property: "endDate",
      };
      const result = constraint.validate("invalid-date", mockArguments);
      expect(result).toBe(false);
    });
  });
});
