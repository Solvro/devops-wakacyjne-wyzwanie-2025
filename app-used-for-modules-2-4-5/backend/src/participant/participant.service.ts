import { Prisma } from "@prisma/client";

import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../database/database.service";
import { CreateParticipantDto } from "./dto/create-participant.dto";
import { UpdateParticipantDto } from "./dto/update-participant.dto";

interface ParticipantOptions {
  where?: Prisma.ParticipantWhereInput;
  orderBy?: Prisma.ParticipantOrderByWithRelationInput;
  skip?: number;
  take?: number;
  include?: Prisma.ParticipantInclude;
}

@Injectable()
export class ParticipantService {
  constructor(private database: DatabaseService) {}

  async create(createParticipantDto: CreateParticipantDto) {
    const { tripsIds, expensesIds, ...participantData } = createParticipantDto;
    return this.database.participant.create({
      data: {
        ...participantData,
        ...(tripsIds !== undefined &&
          tripsIds.length > 0 && {
            trips: {
              connect: tripsIds.map((id) => ({ id })),
            },
          }),
        ...(expensesIds !== undefined &&
          expensesIds.length > 0 && {
            expenses: {
              connect: expensesIds.map((id) => ({ id })),
            },
          }),
      },
    });
  }

  async findAll(options?: ParticipantOptions) {
    return this.database.participant.findMany({
      where: options?.where,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
      include: options?.include,
    });
  }

  async findOne(id: number) {
    return this.database.participant.findUnique({ where: { id } });
  }

  async update(id: number, updateParticipantDto: UpdateParticipantDto) {
    const { tripsIds, expensesIds, ...participantData } = updateParticipantDto;
    return this.database.participant.update({
      where: { id },
      data: {
        ...participantData,
        ...(tripsIds !== undefined && {
          trips:
            tripsIds.length > 0
              ? {
                  set: tripsIds.map((tripId) => ({ id: tripId })),
                }
              : {
                  set: [],
                },
        }),
        ...(expensesIds !== undefined && {
          expenses:
            expensesIds.length > 0
              ? {
                  set: expensesIds.map((expenseId) => ({ id: expenseId })),
                }
              : {
                  set: [],
                },
        }),
      },
    });
  }

  async remove(id: number) {
    return this.database.participant.delete({ where: { id } });
  }
}
