import { db } from "@/lib/db";

export function listUsers() {
    return db.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}
