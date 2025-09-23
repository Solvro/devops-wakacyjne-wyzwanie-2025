import type { Request } from "express";

import type { UserMetadata } from "../../user/dto/user-metadata.dto";

export interface RequestWithUser extends Request {
  user?: UserMetadata | null;
}
