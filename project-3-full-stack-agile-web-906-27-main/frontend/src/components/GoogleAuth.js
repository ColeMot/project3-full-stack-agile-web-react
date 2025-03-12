// GoogleAuth.js

import React, { useState } from 'react';
import firebase from '../firebase';

/**
 * The GoogleAuth component provides a Google sign-in functionality using Firebase Authentication.
 * It allows users to sign in with their Google accounts and handles authentication errors.
 */
const GoogleAuth = ({ onAuthenticated }) => {
  const [error, setError] = useState(null);

  /**
     * Handles the Google sign-in process by initiating the sign-in popup using Firebase Authentication.
     * Upon successful authentication, the provided callback function {@code onAuthenticated} is called
     * with the authenticated user as a parameter. If an error occurs during authentication, it is
     * captured and displayed to the user.
     */
  const handleGoogleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        // Redirect to manager portal upon successful authentication
        onAuthenticated(result.user);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div>
      {error && <p>{error}</p>}
    </div>
  );
};

export default GoogleAuth;
