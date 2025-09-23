import { ValidatorConstraint, registerDecorator } from "class-validator";
import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "NicePassword", async: false })
export class NicePasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, _arguments_: ValidationArguments): boolean {
    if (!password) {
      return false;
    }
    if (password.length < 8) {
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      return false;
    }
    if (!/[0-9]/.test(password)) {
      return false;
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return false;
    }
    return true;
  }
  defaultMessage(_arguments_: ValidationArguments): string {
    return "That's not a nice password, is it? (length must be >=8 and have at least one from every: uppercases/digits/specials)";
  }
}

export const NicePassword =
  (options?: ValidationOptions) => (object: object, propertyName: string) => {
    registerDecorator({
      name: "NicePassword",
      target: object.constructor,
      propertyName,
      options,
      validator: NicePasswordConstraint,
    });
  };
