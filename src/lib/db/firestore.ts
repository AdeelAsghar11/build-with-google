import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let dbInstance: Firestore | null = null;

/**
 * Returns server-only Firestore instance initialized via Admin SDK.
 */
export function getDb(): Firestore {
  if (dbInstance) return dbInstance;

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      // Demo / default credentials fallback
      initializeApp({ projectId: projectId || "moderator-demo" });
    }
  }

  dbInstance = getFirestore();
  return dbInstance;
}
