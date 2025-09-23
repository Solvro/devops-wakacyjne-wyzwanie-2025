import { compare } from "bcrypt";

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { CreateUserDto } from "../user/dto/create-user.dto";
import { UserMetadata } from "../user/dto/user-metadata.dto";
import { UserService } from "../user/user.service";
import { ResponseDto } from "./dto/response.dto";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  private readonly tokenPrefix = "token_";

  private get expiryTimeMs(): number {
    return Number.parseInt(process.env.EXPIRY_TIME_MS ?? "3600000");
  }

  private generateToken(email: string): string {
    const issuedAt = Date.now();
    return `${this.tokenPrefix}${email}_${issuedAt.toString()}`;
  }

  async validateToken(token: string): Promise<UserMetadata> {
    if (!token.startsWith(this.tokenPrefix)) {
      throw new UnauthorizedException("Invalid token format");
    }
    const parts = token.slice(this.tokenPrefix.length).split("_");
    if (parts.length !== 2) {
      throw new UnauthorizedException("Invalid token format");
    }
    const [email, issuedAtString] = parts;
    if (!email || !issuedAtString) {
      throw new UnauthorizedException("Invalid token format");
    }
    const issuedAt = Number(issuedAtString);
    if (Number.isNaN(issuedAt)) {
      throw new UnauthorizedException("Invalid token format");
    }
    const now = Date.now();
    if (now - issuedAt > this.expiryTimeMs) {
      throw new UnauthorizedException("Token has expired");
    }
    try {
      const userMetadata = await this.userService.findOneMetadata(email);
      return userMetadata;
    } catch {
      throw new UnauthorizedException("Invalid token: user not found");
    }
  }

  async signIn(email: string, password: string): Promise<ResponseDto> {
    const user = await this.userService.findOne(email);
    if (user === null) {
      throw new UnauthorizedException();
    }
    if (user.isArchived) {
      throw new UnauthorizedException();
    }
    let passwordMatches: boolean;
    try {
      passwordMatches = await compare(password, user.password);
    } catch {
      passwordMatches = false;
    }
    if (!passwordMatches) {
      throw new UnauthorizedException();
    }
    return { token: this.generateToken(user.email) };
  }

  async signUp(
    email: string,
    username: string | undefined,
    password: string,
    note: string | undefined,
  ): Promise<ResponseDto> {
    const existingUser = await this.userService.findOne(email);
    if (existingUser != null) {
      if (existingUser.isArchived) {
        throw new ConflictException("User with this email is archived");
      }
      throw new ConflictException("User with this email exists");
    }
    const createUserDto: CreateUserDto = {
      email,
      username,
      password,
      note,
    };
    const user = await this.userService.create(createUserDto);
    const token = this.generateToken(user.email);
    return { token };
  }
}
