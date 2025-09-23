import { Prisma } from "@prisma/client";

import { Injectable, NotFoundException } from "@nestjs/common";

import { DatabaseService } from "../database/database.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";

interface TripOptions {
  where?: Prisma.TripWhereInput;
  orderBy?: Prisma.TripOrderByWithRelationInput;
  skip?: number;
  take?: number;
  include?: Prisma.TripInclude;
}

@Injectable()
export class TripService {
  constructor(private database: DatabaseService) {}

  async create(createTripDto: CreateTripDto) {
    const { participantsIds, expensesIds, ...tripData } = createTripDto;
    return this.database.trip.create({
      data: {
        ...tripData,
        ...(participantsIds !== undefined &&
          participantsIds.length > 0 && {
            participants: {
              connect: participantsIds.map((id) => ({ id })),
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

  async findAll(options?: TripOptions) {
    return this.database.trip.findMany({
      where: options?.where,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
      include: options?.include,
    });
  }

  async findOne(id: number, include?: Prisma.TripInclude) {
    const trip = await this.database.trip.findUnique({
      where: { id },
      include,
    });
    if (trip === null) {
      throw new NotFoundException(`Trip with ID ${id.toString()} not found`);
    }
    return trip;
  }

  async update(id: number, updateTripDto: UpdateTripDto) {
    const trip = await this.database.trip.findUnique({ where: { id } });
    if (trip === null) {
      throw new NotFoundException(`Trip with ID ${id.toString()} not found`);
    }

    const { participantsIds, expensesIds, ...tripData } = updateTripDto;

    return this.database.trip.update({
      where: { id },
      data: {
        ...tripData,
        ...(participantsIds !== undefined && {
          participants: {
            set: participantsIds.map((participantId) => ({
              id: participantId,
            })),
          },
        }),
        ...(expensesIds !== undefined && {
          expenses: {
            set: expensesIds.map((expenseId) => ({ id: expenseId })),
          },
        }),
      },
    });
  }

  async remove(id: number) {
    const trip = await this.database.trip.findUnique({ where: { id } });
    if (trip === null) {
      throw new NotFoundException(`Trip with ID ${id.toString()} not found`);
    }
    const deletedTrip = await this.database.trip.delete({ where: { id } });
    return deletedTrip;
  }
}
