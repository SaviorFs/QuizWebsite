import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import QuizList from './components/QuizList';
import TakeQuiz from './components/TakeQuiz'; 
import AdminAddQuiz from './components/AdminAddQuiz';
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
      
          <Route path="/quizlist" element={<QuizList />} />

          
          <Route path="/quiz/:id" element={<TakeQuiz />} />

          {/* Admin-only route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminAddQuiz />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
