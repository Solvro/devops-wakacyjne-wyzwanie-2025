import type { ValidationArguments } from "class-validator";

import { NiceTextConstraint } from "./text.validator";

describe("NiceTextConstraint", () => {
  let constraint: NiceTextConstraint;

  beforeEach(() => {
    constraint = new NiceTextConstraint();
  });

  describe("validate", () => {
    it('should return true for text without "przegryw"', () => {
      const validText = "Tekst";
      const mockArguments: ValidationArguments = {
        value: validText,
        constraints: [],
        targetName: "TestClass",
        object: {},
        property: "note",
      };
      const result = constraint.validate(validText, mockArguments);
      expect(result).toBe(true);
    });

    it('should return false for text with "przegryw"', () => {
      const invalidText = "przegryw";
      const mockArguments: ValidationArguments = {
        value: invalidText,
        constraints: [],
        targetName: "TestClass",
        object: {},
        property: "note",
      };
      const result = constraint.validate(invalidText, mockArguments);
      expect(result).toBe(false);
    });

    it("should return true for empty text", () => {
      const emptyText = "";
      const mockArguments: ValidationArguments = {
        value: emptyText,
        constraints: [],
        targetName: "TestClass",
        object: {},
        property: "note",
      };
      const result = constraint.validate(emptyText, mockArguments);
      expect(result).toBe(true);
    });

    it("should be case sensitive", () => {
      const textWithCapitalPrzegryw = "Jesteś PRZEGRYWEM!";
      const mockArguments: ValidationArguments = {
        value: textWithCapitalPrzegryw,
        constraints: [],
        targetName: "TestClass",
        object: {},
        property: "note",
      };
      const result = constraint.validate(
        textWithCapitalPrzegryw,
        mockArguments,
      );
      expect(result).toBe(true);
    });
  });
});
