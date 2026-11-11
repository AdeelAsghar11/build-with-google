import "server-only";

export interface TeacherUser {
  uid: string;
  email: string;
  name?: string;
}

/**
 * Validates teacher authentication or falls back to demo teacher when AUTH_MODE=demo.
 */
export async function requireTeacher(): Promise<TeacherUser> {
  const authMode = process.env.AUTH_MODE ?? "demo";
  if (authMode === "demo") {
    return {
      uid: "teacher_demo_1",
      email: "teacher@demo.local",
      name: "Demo Teacher",
    };
  }
  throw new Error("Unauthorized: Firebase auth verification not yet configured.");
}
