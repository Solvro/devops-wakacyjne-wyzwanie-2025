import type { ValidationArguments } from "class-validator";

import { NicePasswordConstraint } from "./password.validator";

describe("NicePasswordConstraint", () => {
  let constraint: NicePasswordConstraint;

  beforeEach(() => {
    constraint = new NicePasswordConstraint();
  });

  describe("validate", () => {
    it("should return true for valid password", () => {
      const validPassword = "Haslo123!";
      const mockArguments: ValidationArguments = {
        value: validPassword,
        constraints: [],
        targetName: "TestClass",
        object: {},
        property: "password",
      };
      const result = constraint.validate(validPassword, mockArguments);
      expect(result).toBe(true);
    });

    it("should return false for password without uppercase letter", () => {
      const invalidPassword = "haslo123!";
      const mockArguments: ValidationArguments = {
        value: invalidPassword,
        constraints: [],
        targetName: "TestClass",
        object: {},
        property: "password",
      };
      const result = constraint.validate(invalidPassword, mockArguments);
      expect(result).toBe(false);
    });

    it("should return false for password without digit", () => {
      const invalidPassword = "Haslo!";
      const mockArguments: ValidationArguments = {
        value: invalidPassword,
        constraints: [],
        targetName: "TestClass",
        object: {},
        property: "password",
      };
      const result = constraint.validate(invalidPassword, mockArguments);
      expect(result).toBe(false);
    });

    it("should return false for password without special character", () => {
      const invalidPassword = "Haslo123";
      const mockArguments: ValidationArguments = {
        value: invalidPassword,
        constraints: [],
        targetName: "TestClass",
        object: {},
        property: "password",
      };
      const result = constraint.validate(invalidPassword, mockArguments);
      expect(result).toBe(false);
    });

    it("should return false for password shorter than 8 characters", () => {
      const invalidPassword = "Haslo1!";
      const mockArguments: ValidationArguments = {
        value: invalidPassword,
        constraints: [],
        targetName: "TestClass",
        object: {},
        property: "password",
      };
      const result = constraint.validate(invalidPassword, mockArguments);
      expect(result).toBe(false);
    });
  });
});
