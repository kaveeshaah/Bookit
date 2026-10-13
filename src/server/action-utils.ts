import { ServiceError } from "@/server/services/resource-service";

export type FormState = {
    error?: string;
    fieldErrors?: Record<string, string[] | undefined>;
    values?: Record<string, string>; // lets the form keep what the user typed
};

export function friendlyError(e: unknown): string {
    if (e instanceof ServiceError) return e.message;
    if ((e as { code?: string })?.code === "P2002") return "A record with that value already exists.";
    console.error(e);
    return "Something went wrong. Please try again.";
}
