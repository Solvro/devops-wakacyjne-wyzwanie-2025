import type { Request } from "express";

import type { DatabaseStats } from "./database-stats";

export interface RequestWithDatabase extends Request {
  database?: DatabaseStats;
}
