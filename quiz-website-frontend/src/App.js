import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import QuizList from './components/QuizList';
import TakeQuiz from './components/TakeQuiz';
import QuizResults from './components/QuizResult'; 
import AdminAddQuiz from './components/AdminAddQuiz';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Header /> 

        <Routes>
          <Route path="/" element={<LandingPage />} /> 
          <Route path="/quizlist" element={<QuizList />} /> 
          <Route path="/quiz/:id" element={<TakeQuiz />} /> 
          <Route path="/quiz-results/:id" element={<QuizResults />} /> 

          {/* Admin-only */}
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
