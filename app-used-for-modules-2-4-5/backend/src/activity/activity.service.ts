import { Prisma } from "@prisma/client";

import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../database/database.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";

interface ActivityOptions {
  where?: Prisma.ActivityWhereInput;
  orderBy?: Prisma.ActivityOrderByWithRelationInput;
  skip?: number;
  take?: number;
}

@Injectable()
export class ActivityService {
  constructor(private database: DatabaseService) {}

  async create(createActivityDto: CreateActivityDto) {
    return this.database.activity.create({
      data: createActivityDto,
    });
  }

  async findAll(options?: ActivityOptions) {
    return this.database.activity.findMany({
      where: options?.where,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
    });
  }

  async findOne(id: number) {
    return this.database.activity.findUnique({ where: { id } });
  }

  async update(id: number, updateActivityDto: UpdateActivityDto) {
    return this.database.activity.update({
      where: { id },
      data: updateActivityDto,
    });
  }

  async remove(id: number) {
    return this.database.activity.delete({ where: { id } });
  }
}
