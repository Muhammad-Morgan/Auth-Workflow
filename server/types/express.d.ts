import { UploadedFile } from "express-fileupload";
import type { UserPayload } from "../models/User";
import "express-fileupload";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserPayload;
    files?: {
      image: UploadedFile;
    };
  }
}

export {};
