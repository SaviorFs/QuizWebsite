import { useEffect, useState } from 'react';
import { auth, db } from './firebase'; // Adjust your firebase path if needed
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // For loading state while checking

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // Begin loading

      if (user) {
        setCurrentUser(user); // Set the current user
        try {
          // Fetch user admin status from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists() && userSnap.data().isAdmin) {
            setIsAdmin(true); // User is an admin
          } else {
            setIsAdmin(false); // User is not an admin
          }
        } catch (error) {
          console.error('Error fetching admin status:', error.message);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false); // Not logged in, not admin
      }

      setLoading(false); // Stop loading
    });

    // Cleanup the subscription on component unmount
    return () => unsubscribe();
  }, []);

  return { currentUser, isAdmin, loading };
};
