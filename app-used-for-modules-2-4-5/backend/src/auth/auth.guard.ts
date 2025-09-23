import { Request } from "express";

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { RequestWithUser } from "./dto/request-with-user.dto";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (token === undefined) {
      throw new UnauthorizedException("Missing token");
    }
    try {
      request.user = await this.authService.validateToken(token);
    } catch (error) {
      throw new UnauthorizedException((error as Error).message);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization?.trim();
    if (authorization === undefined || authorization === "") {
      return undefined;
    }
    const [type, token] = authorization.split(/\s+/);
    return type === "Bearer" ? token : undefined;
  }
}
