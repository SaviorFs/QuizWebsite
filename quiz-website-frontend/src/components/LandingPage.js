import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'; 
import { doc, setDoc } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(true); 
  const navigate = useNavigate();

  
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        isAdmin: false,
      });

      alert('Signed up successfully!');
      navigate('/quizlist');
    } catch (error) {
      console.error('Error signing up:', error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Logged in successfully');
      navigate('/quizlist');
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div>
      <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
      <form onSubmit={isSignup ? handleSignup : handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">{isSignup ? 'Sign Up' : 'Log In'}</button>
      </form>

      <p>
        {isSignup
          ? "Already have an account? "
          : "Don't have an account yet? "}
        <button onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Log In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};

export default LandingPage;
