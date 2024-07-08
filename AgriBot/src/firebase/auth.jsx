import { auth } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  return result;
};

export const doSignOut = async () => {
  return auth.signOut();
};

export const doPasswordReset = async (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const updateUserProfile = async (displayName) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    // Update the user's profile
    return updateProfile(user, {
      displayName: displayName,
      photoURL: null,
    })
     
  } else {
    console.error("No user is signed in to update.");
    // Handle cases where no user is signed in
  }
};
