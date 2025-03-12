// utility.js
import firebase from '../firebase';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * The useRoleRequired hook is a utility hook designed to restrict access to certain routes or components
 * based on user roles. It utilizes Firebase Authentication and Firestore to authenticate users and check
 * their assigned roles.
 */
export function useRoleRequired(roleRequired, redirectPath = '/') {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in, check the role
        firebase.firestore().collection('users').doc(user.uid).get()
          .then(doc => {
            if (!doc.exists || !roleRequired.includes(doc.data().role)) {
              alert('Access Denied, please check with your adminstrator for assigned privelleges.');
              navigate(redirectPath);
            }
          });
      } else {
        // User is not signed in, initiate Google sign-in
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).catch(error => {
          console.error("Authentication error:", error);
          alert('Authentication is required to access this page.');
          navigate(redirectPath); // Optional: Navigate away on failure
        });
      }
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, [navigate, roleRequired, redirectPath]);

  return null; // This hook does not render anything
}
