import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const ADMIN_EMAILS = new Set([
  'soumyajit.scms@gmail.com',
  'soumyajit.biswas.14444@gmail.com',
]);

const app = initializeApp(firebaseConfig);
const databaseId =
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId ||
  'ai-studio-8ba0d8fc-8bb7-4032-bf42-099d2364d7f5';

export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.events',
] as const;

const visitorProvider = new GoogleAuthProvider();
visitorProvider.addScope('https://www.googleapis.com/auth/gmail.send');
visitorProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

const workspaceProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => workspaceProvider.addScope(scope));

let cachedWorkspaceAccessToken: string | null = null;
let cachedTokenHasCalendar = false;

export function getGmailAccessToken(): string | null {
  return cachedWorkspaceAccessToken;
}

export function hasCalendarAccessToken(): boolean {
  return Boolean(cachedWorkspaceAccessToken && cachedTokenHasCalendar);
}

export function clearGmailAccessToken(): void {
  cachedWorkspaceAccessToken = null;
  cachedTokenHasCalendar = false;
}

export function isAdminUser(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.emailVerified && ADMIN_EMAILS.has(user.email.toLowerCase());
}

export async function signInWithGoogle(includeCalendarScope = false): Promise<{
  user: User;
  accessToken: string | null;
}> {
  const provider = includeCalendarScope ? workspaceProvider : visitorProvider;
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (credential?.accessToken) {
    cachedWorkspaceAccessToken = credential.accessToken;
    cachedTokenHasCalendar = includeCalendarScope;
  }
  return {
    user: result.user,
    accessToken: cachedWorkspaceAccessToken,
  };
}

export async function logoutGoogle(): Promise<void> {
  cachedWorkspaceAccessToken = null;
  cachedTokenHasCalendar = false;
  await signOut(auth);
}

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      clearGmailAccessToken();
    }
    callback(user);
  });
}

// Startup Firestore connection validation per Firebase integration guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
    }
  }
}
void testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
