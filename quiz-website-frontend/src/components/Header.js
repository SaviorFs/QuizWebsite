import React, { useEffect, useState } from 'react';
import { auth } from '../firebase'; 
import { signOut } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom'; 

const Header = () => {
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();

  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); 
  }, []);

  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/'); 
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <h1>Quiz Website</h1>
      </div>
      <div style={styles.userInfo}>
        {user ? (
          <>
            <span style={styles.userEmail}>{user.email}</span>
            <button style={styles.signOutButton} onClick={handleSignOut}>
              Log Out
            </button>
          </>
        ) : (
          <span>Loading...</span>
        )}
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  userEmail: {
    marginRight: '20px',
    fontSize: '16px',
  },
  signOutButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Header;
