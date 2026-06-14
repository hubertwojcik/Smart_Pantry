import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { firebaseAuth } from "./index";

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
}

export const mapFirebaseUser = (user: User): AuthUser => ({
  uid: user.uid,
  name: user.displayName ?? user.email?.split("@")[0] ?? "Użytkownik",
  email: user.email ?? "",
});

/** Subskrypcja stanu sesji. Firebase odtwarza ją na starcie z expo-secure-store. */
export const subscribeToAuthChanges = (
  callback: (user: AuthUser | null) => void,
) =>
  onAuthStateChanged(firebaseAuth, (user) => {
    callback(user ? mapFirebaseUser(user) : null);
  });

export const signIn = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );
  return mapFirebaseUser(credential.user);
};

export const signUp = async (
  name: string,
  email: string,
  password: string,
) => {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );
  await updateProfile(credential.user, { displayName: name });
  return { ...mapFirebaseUser(credential.user), name };
};

export const signOutUser = () => signOut(firebaseAuth);

/** Aktualny token ID (np. do uwierzytelnionych zapytań do własnego backendu). */
export const getCurrentToken = () =>
  firebaseAuth.currentUser?.getIdToken() ?? Promise.resolve(null);

/** Mapowanie kodów błędów Firebase na komunikaty po polsku. */
export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Nieprawidłowy adres e-mail.";
      case "auth/user-disabled":
        return "To konto zostało zablokowane.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Nieprawidłowy e-mail lub hasło.";
      case "auth/email-already-in-use":
        return "Konto z tym adresem e-mail już istnieje.";
      case "auth/weak-password":
        return "Hasło jest zbyt słabe (min. 6 znaków).";
      case "auth/network-request-failed":
        return "Brak połączenia z siecią. Spróbuj ponownie.";
      case "auth/too-many-requests":
        return "Zbyt wiele prób. Spróbuj ponownie później.";
      default:
        return "Wystąpił błąd uwierzytelniania. Spróbuj ponownie.";
    }
  }
  return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
};
