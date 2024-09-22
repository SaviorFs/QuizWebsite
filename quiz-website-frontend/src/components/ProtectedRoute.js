import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../useAuth'; 

const ProtectedRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/quizlist" />; 
  }

  return children; 
};

export default ProtectedRoute;
