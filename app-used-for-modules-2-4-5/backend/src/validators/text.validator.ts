import { ValidatorConstraint, registerDecorator } from "class-validator";
import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "NiceText", async: false })
export class NiceTextConstraint implements ValidatorConstraintInterface {
  validate(text: string, _arguments_: ValidationArguments): boolean {
    if (!text) {
      return true;
    }
    return !text.includes("przegryw");
  }
  defaultMessage(_arguments_: ValidationArguments): string {
    return "That's not a nice text, is it?";
  }
}

export const NiceText =
  (options?: ValidationOptions) => (object: object, propertyName: string) => {
    registerDecorator({
      name: "NiceText",
      target: object.constructor,
      propertyName,
      options,
      validator: NiceTextConstraint,
    });
  };
