import {
  ExpenseCategory,
  ParticipantRole,
  ParticipantSex,
  Role,
  TripCategory,
} from "@prisma/client";
import { hash } from "bcrypt";

import { testPrisma } from "./clean-database";

export async function seedDatabase() {
  await testPrisma.trip.createMany({
    data: [
      {
        id: 1,
        title: "Wyjazd nad morze Bałtyckie",
        category: TripCategory.LEISURE,
        destination: "Kołobrzeg, Poland",
        budget: 2000,
        startDate: new Date("2025-07-01"),
        endDate: new Date("2025-07-07"),
        accommodation: "Arka Medical Spa",
        travelTime: 4.5,
        travelDistance: 500,
        note: "Wakacje rodzinne w kraju",
        isArchived: false,
      },
      {
        id: 2,
        title: "Konferencja biznesowa",
        category: TripCategory.BUSINESS,
        destination: "Warszawa, Polska",
        budget: 1500,
        startDate: new Date("2024-08-15"),
        endDate: new Date("2024-08-18"),
        accommodation: "Warsaw Presidential Hotel",
        travelTime: 2,
        travelDistance: 500,
        note: "Coroczny wyjazd",
        isArchived: false,
      },
    ],
  });

  await testPrisma.participant.createMany({
    data: [
      {
        id: 1,
        name: "Adam",
        surname: "Nowak",
        role: ParticipantRole.PARTICIPANT,
        email: "adam.nowak@imejl.pl",
        phone: "123456789",
        address: "ul. Warszawska 9, 99-999 Warszawa",
        iban: "16000000000000000000000000",
        isAdult: true,
        dateOfBirth: new Date("1990-01-01"),
        placeOfBirth: "Gdańsk",
        sex: ParticipantSex.MALE,
        note: "uczestnik",
        isArchived: false,
      },
      {
        id: 2,
        name: "Joanna",
        surname: "Nowak",
        role: ParticipantRole.GUIDE,
        email: "joanna.nowak@imejl.pl",
        phone: "987654321",
        address: "ul. Warszawska 9, 99-999 Warszawa",
        iban: "169999999999999999999999",
        isAdult: true,
        dateOfBirth: new Date("1985-05-15"),
        placeOfBirth: "Gdańsk",
        sex: ParticipantSex.FEMALE,
        note: "organizatorka",
        isArchived: false,
      },
    ],
  });

  await testPrisma.expense.createMany({
    data: [
      {
        id: 1,
        title: "Spektakl w teatrze",
        category: ExpenseCategory.ENTERTAINMENT,
        recipientName: "Teatr Polski, Wrocław",
        recipientIban: "161234567891234678913456",
        quantity: 7,
        currency: "PLN",
        amount: 1200,
        budgetLeft: 800,
        note: "Najlepiej oceniany spektakl",
        participantId: 1,
        tripId: 1,
        isArchived: false,
      },
      {
        id: 2,
        title: "Bilety lotnicze",
        category: ExpenseCategory.TRANSPORT,
        recipientName: "LOT",
        recipientIban: "16987654231987654321987654",
        quantity: 2,
        currency: "PLN",
        amount: 1600,
        budgetLeft: 900,
        note: "Lot w obie strony",
        participantId: 2,
        tripId: 2,
        isArchived: false,
      },
    ],
  });

  await Promise.all([
    testPrisma.trip.update({
      where: { id: 1 },
      data: {
        participants: {
          connect: [{ id: 1 }, { id: 2 }],
        },
      },
    }),

    testPrisma.trip.update({
      where: { id: 2 },
      data: {
        participants: {
          connect: [{ id: 1 }],
        },
      },
    }),
  ]);

  await testPrisma.user.createMany({
    data: [
      {
        email: "adam.nowak@imejl.pl",
        username: "nowakowski",
        password: await hash("haslo", 10),
        role: Role.USER,
        note: "uzytkownik",
        isArchived: false,
      },
      {
        email: "admin@example.com",
        username: "admin",
        password: await hash("password", 10),
        role: Role.ADMIN,
        note: "admin",
        isArchived: false,
      },
    ],
  });

  await testPrisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Trip"', 'id'), MAX(id)) FROM "Trip";`;
  await testPrisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Participant"', 'id'), MAX(id)) FROM "Participant";`;
  await testPrisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Expense"', 'id'), MAX(id)) FROM "Expense";`;
}
