import { drizzle } from "drizzle-orm/node-postgres";
import { pool as sharedPool } from "@workspace/db";
import * as schema from "@workspace/db";

export const db = drizzle(sharedPool, { schema });
export { schema };
