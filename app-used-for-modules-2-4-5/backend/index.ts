import { writeFileSync } from "node:fs";

function eloZelo(repeats: number): void {
  const line = "Elo żelo";
  const file = "elo-żelo.txt";
  const contents = `${line}\n`.repeat(repeats);
  writeFileSync(file, contents);
}

eloZelo(new Date().getMinutes());
