import { JwtPayload } from "jsonwebtoken";

export interface UserInfo {
  name: string;
  email: string;
  oid: string;
  [key: string]: unknown; // Allow additional token claims
}

declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
    }
  }
}

