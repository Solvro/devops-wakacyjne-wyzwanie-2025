import { ValidatorConstraint, registerDecorator } from "class-validator";
import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "NiceDate", async: false })
export class NiceDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, arguments_: ValidationArguments): boolean {
    const relatedPropertyName = this.getPropertyName(arguments_.constraints);
    if (relatedPropertyName == null) {
      return false;
    }
    const relatedValue = (arguments_.object as Record<string, unknown>)[
      relatedPropertyName
    ];
    if (value == null || relatedValue == null) {
      return true;
    }
    if (typeof value !== "string" && !(value instanceof Date)) {
      return false;
    }
    if (typeof relatedValue !== "string" && !(relatedValue instanceof Date)) {
      return false;
    }
    const currentDate = this.parseDate(value);
    const relatedDate = this.parseDate(relatedValue);
    if (!this.isValidDate(currentDate) || !this.isValidDate(relatedDate)) {
      return false;
    }
    return currentDate > relatedDate;
  }
  defaultMessage(arguments_: ValidationArguments): string {
    const relatedPropertyName = this.getPropertyName(arguments_.constraints);
    return `That's not a nice date, is it? (${arguments_.property} must be after ${relatedPropertyName ?? "the specified date"})`;
  }

  private getPropertyName(constraints: readonly unknown[]): string | null {
    if (constraints.length > 0) {
      const firstConstraint = constraints[0];
      if (typeof firstConstraint === "string") {
        return firstConstraint;
      }
    }
    return null;
  }

  private parseDate(value: string | Date): Date {
    if (value instanceof Date) {
      return value;
    }
    return new Date(value);
  }

  private isValidDate(date: Date): boolean {
    return !Number.isNaN(date.getTime());
  }
}

export const NiceDate =
  (
    property: string,
    validationOptions?: ValidationOptions & {
      inclusive?: boolean;
      compareTime?: boolean;
    },
  ) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      name: "NiceDate",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: NiceDateConstraint,
    });
  };
