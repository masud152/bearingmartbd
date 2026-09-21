import "server-only";
import { db } from "./database";
import { mediaStorage } from "./storage";

export const env = { DB: db, PRODUCT_IMAGES: mediaStorage };
