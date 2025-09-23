import {
  ActivityCategory,
  ExpenseCategory,
  ParticipantRole,
  ParticipantSex,
  PrismaClient,
  Role,
  TripCategory,
} from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.participant.deleteMany();

  const createdParticipants = await Promise.all([
    prisma.participant.create({
      data: {
        role: ParticipantRole.ORGANIZER,
        name: "Jan",
        surname: "Kowalski",
        email: "jan.kowalski@imejl.pl",
        phone: "+48 123 456 789",
        address: "ul. Wrocławska 1, 00-001 Wrocław",
        iban: "12 3456 7890 1234 5678 9012 3456",
        isAdult: true,
        dateOfBirth: new Date("1960-01-01"),
        placeOfBirth: "Wrocław",
        sex: ParticipantSex.MALE,
      },
    }),

    prisma.participant.create({
      data: {
        role: ParticipantRole.PARTICIPANT,
        name: "Anna",
        surname: "Kowalska",
        email: "anna.kowalska@imejl.pl",
        phone: "+48 987 654 321",
        address: "ul. Krakowska 2137, 69-420 Kraków",
        iban: "98 7654 3210 9876 5432 1098 7654",
        isAdult: true,
        dateOfBirth: new Date("1966-12-31"),
        sex: ParticipantSex.FEMALE,
        placeOfBirth: "Kraków",
      },
    }),

    prisma.participant.create({
      data: {
        role: ParticipantRole.PARTICIPANT,
        name: "Paweł",
        surname: "Kowalski",
        email: "panpawel@imejl.pl",
        address: "ul. Ulicowa 6, 66-666 Miastowo",
        isAdult: true,
        dateOfBirth: new Date("2004-02-29"),
        placeOfBirth: "Urodzinów",
        sex: ParticipantSex.MALE,
        note: "Student bez budżetu",
      },
    }),

    prisma.participant.create({
      data: {
        role: ParticipantRole.GUEST,
        name: "Kasia",
        surname: "Gość",
        email: "kasia.gosc@imejl.pl",
        phone: "+48 888 999 000",
        address: "ul. Gościnna 7312, 420-69 Gościnnowo",
        isAdult: true,
        placeOfBirth: "Gościnnowo",
        sex: ParticipantSex.FEMALE,
      },
    }),

    prisma.participant.create({
      data: {
        role: ParticipantRole.VOLUNTEER,
        name: "Tomek",
        surname: "Pomocnik",
        email: "tomek.pomocnik@imejl.pl",
        phone: "+48 111 222 333",
        address: "ul. Pomocna 96, 7312-024 Pomocnowo",
        isAdult: true,
        placeOfBirth: "Pomocnowo",
        sex: ParticipantSex.MALE,
      },
    }),

    prisma.participant.create({
      data: {
        role: ParticipantRole.ORGANIZER,
        name: "wsparcie",
        surname: "dev",
        email: "your.email@gmail.com",
        sex: ParticipantSex.MALE,
      },
    }),
  ]);

  const createdTrips = await Promise.all([
    prisma.trip.create({
      data: {
        category: TripCategory.VACATION,
        title: "Wakacje w Hiszpanii",
        destination: "Barcelona, Hiszpania",
        budget: 5000,
        startDate: new Date("2025-08-15T08:00:00Z"),
        endDate: new Date("2025-08-22T20:00:00Z"),
        accommodation: "Hotel Barceló Barcelona, Barcelona",
        travelTime: 165,
        travelDistance: 1348.5,
      },
    }),

    prisma.trip.create({
      data: {
        category: TripCategory.BUSINESS,
        title: "Konferencja IT w Berlinie",
        destination: "Berlin, Niemcy",
        budget: 2500,
        startDate: new Date("2025-10-10T06:00:00Z"),
        endDate: new Date("2025-10-12T22:00:00Z"),
        accommodation: "Hotel Adlon Berlin, Berlin",
      },
    }),

    prisma.trip.create({
      data: {
        category: TripCategory.PERSONAL,
        title: "Weekend w Zakopanem",
        destination: "Zakopane, Polska",
        budget: 800,
        startDate: new Date("2025-07-01T16:00:00Z"),
        endDate: new Date("2025-07-03T18:00:00Z"),
        travelTime: 120,
        travelDistance: 102.3,
      },
    }),

    prisma.trip.create({
      data: {
        category: TripCategory.FAMILY,
        title: "Wyjazd nad morze",
        destination: "Władysławowo, Polska",
        budget: 3200,
        startDate: new Date("2025-09-05T10:00:00Z"),
        endDate: new Date("2025-09-12T16:00:00Z"),
        accommodation: "Pensjonat Morski, Władysławowo",
        travelTime: 280,
        travelDistance: 380,
        note: "Przepłacone wakacje nad Bałtykiem",
      },
    }),

    prisma.trip.create({
      data: {
        category: TripCategory.VACATION,
        title: "Email test",
        destination: "skrzynka email",
        budget: 9999,
        startDate: new Date("2025-08-15T08:00:00Z"),
        endDate: new Date("2025-08-22T20:00:00Z"),
        accommodation: "serwer",
        travelTime: 99,
        travelDistance: 999,
      },
    }),
  ]);

  await Promise.all([
    prisma.trip.update({
      where: { id: createdTrips[0].id },
      data: {
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[1].id },
            { id: createdParticipants[2].id },
            { id: createdParticipants[4].id },
          ],
        },
      },
    }),

    prisma.trip.update({
      where: { id: createdTrips[1].id },
      data: {
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[1].id },
          ],
        },
      },
    }),

    prisma.trip.update({
      where: { id: createdTrips[2].id },
      data: {
        participants: {
          connect: [{ id: createdParticipants[2].id }],
        },
      },
    }),

    prisma.trip.update({
      where: { id: createdTrips[3].id },
      data: {
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[1].id },
            { id: createdParticipants[3].id },
          ],
        },
      },
    }),

    prisma.trip.update({
      where: { id: createdTrips[4].id },
      data: {
        participants: {
          connect: [{ id: createdParticipants[5].id }],
        },
      },
    }),
  ]);

  const createdActivities = await Promise.all([
    prisma.activity.create({
      data: {
        name: "Zwiedzanie Sagrada Familia",
        place: "Barcelona, Hiszpania",
        startDate: new Date("2025-08-16T10:00:00Z"),
        endDate: new Date("2025-08-16T12:00:00Z"),
        category: ActivityCategory.CULTURE,
        tripId: createdTrips[0].id,
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[1].id },
            { id: createdParticipants[2].id },
          ],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Spacer po Park Güell",
        place: "Park Güell, Barcelona",
        startDate: new Date("2025-08-16T14:00:00Z"),
        endDate: new Date("2025-08-16T17:00:00Z"),
        category: ActivityCategory.SIGHTSEEING,
        tripId: createdTrips[0].id,
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[1].id },
            { id: createdParticipants[4].id },
          ],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Plażowanie na Barceloneta",
        place: "Plaża Barceloneta, Barcelona",
        startDate: new Date("2025-08-17T11:00:00Z"),
        endDate: new Date("2025-08-17T16:00:00Z"),
        category: ActivityCategory.LEISURE,
        tripId: createdTrips[0].id,
        participants: {
          connect: [
            { id: createdParticipants[1].id },
            { id: createdParticipants[2].id },
            { id: createdParticipants[4].id },
          ],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Mecz FC Barcelona",
        place: "Camp Nou, Barcelona",
        startDate: new Date("2025-08-18T21:00:00Z"),
        endDate: new Date("2025-08-18T23:00:00Z"),
        category: ActivityCategory.SPORTS,
        note: "FC Barcelona vs Real Madrid",
        tripId: createdTrips[0].id,
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[2].id },
          ],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Główna konferencja IT",
        place: "Berlin Congress Center",
        startDate: new Date("2025-10-10T09:00:00Z"),
        endDate: new Date("2025-10-10T17:00:00Z"),
        category: ActivityCategory.OTHER,
        note: "Główne prezentacje",
        tripId: createdTrips[1].id,
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[1].id },
          ],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Warsztaty AI w Machine Learning",
        place: "Berlin Congress Center",
        startDate: new Date("2025-10-11T10:00:00Z"),
        endDate: new Date("2025-10-11T16:00:00Z"),
        category: ActivityCategory.OTHER,
        tripId: createdTrips[1].id,
        participants: {
          connect: [{ id: createdParticipants[0].id }],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Zwiedzanie Bramy Brandenburskiej",
        place: "Brama Brandenburskiej, Berlin",
        startDate: new Date("2025-10-11T18:00:00Z"),
        endDate: new Date("2025-10-11T19:30:00Z"),
        category: ActivityCategory.SIGHTSEEING,
        tripId: createdTrips[1].id,
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[1].id },
          ],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Wycieczka na Morskie Oko",
        place: "Morskie Oko, Tatry",
        startDate: new Date("2025-07-02T08:00:00Z"),
        endDate: new Date("2025-07-02T16:00:00Z"),
        category: ActivityCategory.NATURE,
        tripId: createdTrips[2].id,
        participants: {
          connect: [{ id: createdParticipants[2].id }],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Spacer Krupówkami",
        place: "ul. Krupówki, Zakopane",
        startDate: new Date("2025-07-02T19:00:00Z"),
        endDate: new Date("2025-07-02T22:00:00Z"),
        category: ActivityCategory.SIGHTSEEING,
        note: "Poznanie regionalnych smaków",
        tripId: createdTrips[2].id,
        participants: {
          connect: [{ id: createdParticipants[2].id }],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Plażowanie nad Bałtykiem",
        place: "Plaża w Władysławowie",
        startDate: new Date("2025-09-06T10:00:00Z"),
        endDate: new Date("2025-09-06T18:00:00Z"),
        category: ActivityCategory.LEISURE,
        note: "Zabrać przekąski",
        tripId: createdTrips[3].id,
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[1].id },
            { id: createdParticipants[3].id },
          ],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Rejs statkiem po Zatoce Puckiej",
        place: "Port w Pucku",
        startDate: new Date("2025-09-07T14:00:00Z"),
        endDate: new Date("2025-09-07T17:00:00Z"),
        category: ActivityCategory.NATURE,
        tripId: createdTrips[3].id,
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[1].id },
            { id: createdParticipants[3].id },
          ],
        },
      },
    }),

    prisma.activity.create({
      data: {
        name: "Spacer po wydmach w Słowiński Park Narodowy",
        place: "Słowiński Park Narodowy",
        startDate: new Date("2025-09-09T09:00:00Z"),
        endDate: new Date("2025-09-09T14:00:00Z"),
        category: ActivityCategory.NATURE,
        note: "Zabrać krem przeciwsłoneczny",
        tripId: createdTrips[3].id,
        participants: {
          connect: [
            { id: createdParticipants[0].id },
            { id: createdParticipants[3].id },
          ],
        },
      },
    }),
  ]);

  await Promise.all([
    prisma.expense.create({
      data: {
        category: ExpenseCategory.ACCOMMODATION,
        title: "Hotel w Barcelonie",
        recipientName: "Hotel Barceló Barcelona",
        currency: "EUR",
        quantity: 4,
        amount: 1200,
        budgetLeft: 3800,
        note: "7 nocy, śniadania wliczone",
        participantId: createdParticipants[0].id,
        tripId: createdTrips[0].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.TRANSPORT,
        title: "Bilety lotnicze do Barcelony",
        recipientName: "Ryanair",
        quantity: 4,
        currency: "PLN",
        amount: 1800,
        budgetLeft: 2000,
        note: "Lot w obie strony",
        participantId: createdParticipants[1].id,
        tripId: createdTrips[0].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.FOOD,
        title: "Kolacja w La Boqueria",
        recipientName: "Mercado de La Boqueria",
        currency: "EUR",
        amount: 85,
        participantId: createdParticipants[2].id,
        tripId: createdTrips[0].id,
        activityId: createdActivities[5].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.TRANSPORT,
        title: "Bilety do metra",
        recipientName: "TMB Barcelona",
        currency: "EUR",
        quantity: 4,
        amount: 140,
        participantId: createdParticipants[0].id,
        tripId: createdTrips[0].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.ACCOMMODATION,
        title: "Hotel biznesowy",
        recipientName: "Hotel Adlon Berlin",
        currency: "EUR",
        amount: 450,
        budgetLeft: 2050,
        note: "2 noce",
        participantId: createdParticipants[0].id,
        tripId: createdTrips[1].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.TRANSPORT,
        title: "Bilety Warszawa-Berlin",
        recipientName: "PKP Intercity",
        currency: "PLN",
        quantity: 2,
        amount: 752,
        note: "Bilet w obie strony 1 klasa",
        participantId: createdParticipants[1].id,
        tripId: createdTrips[1].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.OTHER,
        title: "Opłata za konferencję",
        recipientName: "Berlin Tech Conference",
        currency: "EUR",
        quantity: 2,
        amount: 600,
        participantId: createdParticipants[0].id,
        tripId: createdTrips[1].id,
        activityId: createdActivities[6].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.ACCOMMODATION,
        title: "Pensjonat pod Giewontem",
        currency: "PLN",
        amount: 400,
        budgetLeft: 400,
        note: "2 noce",
        participantId: createdParticipants[2].id,
        tripId: createdTrips[2].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.FOOD,
        title: "Oscypek i herbata na Morskim Oku",
        currency: "PLN",
        amount: 45,
        participantId: createdParticipants[2].id,
        tripId: createdTrips[2].id,
        activityId: createdActivities[8].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.ACCOMMODATION,
        title: "Pensjonat Morski",
        recipientName: "Pensjonat Morski",
        currency: "PLN",
        quantity: 4,
        amount: 2100,
        budgetLeft: 1100,
        note: "7 nocy z wyżywieniem",
        participantId: createdParticipants[0].id,
        tripId: createdTrips[3].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.TRANSPORT,
        title: "Paliwo Wrocław-Władysławowo",
        recipientName: "Orlen",
        currency: "PLN",
        amount: 280,
        participantId: createdParticipants[3].id,
        tripId: createdTrips[3].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.TRANSPORT,
        title: "Rejs Zatoka Pucka",
        recipientName: "Żegluga Pucka",
        currency: "PLN",
        quantity: 3,
        amount: 200,
        note: "Bilety dla 3 osób",
        participantId: createdParticipants[4].id,
        tripId: createdTrips[3].id,
        activityId: createdActivities[11].id,
      },
    }),

    prisma.expense.create({
      data: {
        category: ExpenseCategory.ACCOMMODATION,
        title: "List",
        recipientName: "wsparcie",
        currency: "PLN",
        quantity: 1,
        amount: 99,
        budgetLeft: 9,
        note: "list",
        participantId: createdParticipants[5].id,
        tripId: createdTrips[4].id,
      },
    }),
  ]);

  const password = await hash("haslo", 10);
  await Promise.all([
    prisma.user.create({
      data: {
        email: "jan.kowalski@imejl.pl",
        username: "janko",
        password: password,
        role: Role.ADMIN,
        isArchived: false,
        participant: {
          connect: {
            id: createdParticipants[0].id,
          },
        },
      },
    }),

    prisma.user.create({
      data: {
        email: "anna.kowalska@imejl.pl",
        username: "anka",
        password: password,
        role: Role.USER,
        isArchived: false,
        participant: {
          connect: {
            id: createdParticipants[1].id,
          },
        },
      },
    }),

    prisma.user.create({
      data: {
        email: "panpawel@imejl.pl",
        username: "panpawel",
        password: password,
        role: Role.USER,
        isArchived: false,
        participant: {
          connect: {
            id: createdParticipants[2].id,
          },
        },
      },
    }),

    prisma.user.create({
      data: {
        email: "admin@imejl.pl",
        username: "admin",
        password: password,
        role: Role.ADMIN,
        isArchived: false,
      },
    }),
  ]);
}

main()
  .catch((error: unknown) => {
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
