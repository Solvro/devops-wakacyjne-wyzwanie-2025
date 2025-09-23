import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResponseDto } from "./dto/response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Log in with an existing account",
  })
  @ApiResponse({
    status: 200,
    description: "Logged in successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials or account deactivated",
  })
  async signIn(@Body() loginDto: LoginDto): Promise<ResponseDto> {
    return this.authService.signIn(loginDto.email, loginDto.password);
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new account",
  })
  @ApiResponse({
    status: 201,
    description: "Account created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid data or validation failed",
  })
  @ApiResponse({
    status: 409,
    description: "Account already exists",
  })
  async signUp(@Body() registerDto: RegisterDto): Promise<ResponseDto> {
    return this.authService.signUp(
      registerDto.email,
      registerDto.username,
      registerDto.password,
      registerDto.note,
    );
  }
}
