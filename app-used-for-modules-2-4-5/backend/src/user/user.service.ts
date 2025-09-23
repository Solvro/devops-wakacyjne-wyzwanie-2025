import { Role, User } from "@prisma/client";
import { hash } from "bcrypt";

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { DatabaseService } from "../database/database.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserMetadata, userToMetadata } from "./dto/user-metadata.dto";

@Injectable()
export class UserService {
  constructor(private database: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<UserMetadata> {
    const user = await this.database.user.create({
      data: {
        email: createUserDto.email,
        username: createUserDto.username,
        password: await hash(createUserDto.password, 10),
        role: Role.USER,
        note: createUserDto.note,
      },
    });
    return userToMetadata(user);
  }

  async findAll(): Promise<UserMetadata[]> {
    const users = await this.database.user.findMany({
      where: { isArchived: false },
    });
    return users.map((user) => userToMetadata(user));
  }

  async findOne(email: string): Promise<User | null> {
    const user = await this.database.user.findUnique({
      where: { email },
    });
    if (user == null) {
      throw new NotFoundException(`User ${email} not found`);
    }
    return user;
  }

  async findOneMetadata(email: string): Promise<UserMetadata> {
    const user = await this.database.user.findUnique({
      where: { email },
    });
    if (user == null) {
      throw new NotFoundException(`User ${email} not found`);
    }
    return userToMetadata(user);
  }

  async update(
    email: string,
    updateUserDto: UpdateUserDto,
    currentUser: { email: string; role: Role },
  ): Promise<UserMetadata> {
    const existingUser = await this.database.user.findUnique({
      where: { email },
    });
    if (existingUser == null) {
      throw new NotFoundException(`User ${email} not found`);
    }
    const isAdmin = currentUser.role === Role.ADMIN;
    if (!isAdmin && currentUser.email !== email) {
      throw new ForbiddenException(
        "Admin rights required to update other users.",
      );
    }
    const updateData: Partial<UpdateUserDto & { password?: string }> =
      Object.assign({}, updateUserDto);
    if (updateUserDto.password != null && updateUserDto.password !== "") {
      updateData.password = await hash(updateUserDto.password, 10);
    }
    const user = await this.database.user.update({
      where: { email },
      data: updateData,
    });
    return userToMetadata(user);
  }

  async archive(email: string): Promise<UserMetadata> {
    const existingUser = await this.database.user.findUnique({
      where: { email },
    });
    if (existingUser == null) {
      throw new NotFoundException(`User ${email} not found`);
    }
    const user = await this.database.user.update({
      where: { email },
      data: { isArchived: true },
    });
    return userToMetadata(user);
  }

  async dearchive(email: string): Promise<UserMetadata> {
    const existingUser = await this.database.user.findUnique({
      where: { email },
    });
    if (existingUser === null) {
      throw new NotFoundException(`User ${email} not found`);
    }
    const user = await this.database.user.update({
      where: { email },
      data: { isArchived: false },
    });
    return userToMetadata(user);
  }

  async remove(email: string): Promise<void> {
    const existingUser = await this.database.user.findUnique({
      where: { email },
    });
    if (existingUser === null) {
      throw new NotFoundException(`User ${email} not found`);
    }
    await this.database.user.delete({
      where: { email },
    });
  }
}
