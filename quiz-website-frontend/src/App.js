import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import QuizList from './components/QuizList';
import TakeQuiz from './components/TakeQuiz';
import QuizResult from './components/QuizResults';
import AdminQuizManager from './components/AdminQuizManager';
import ProtectedRoute from './components/ProtectedRoute';
import EditQuiz from './components/EditQuiz';
import QuizResults from './components/QuizResults'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Header />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quizlist" element={<QuizList />} />
          <Route path="/quiz/:id" element={<TakeQuiz />} />
          <Route path="/quiz/:quizId/result" element={<QuizResult />} />
          <Route path="/quiz-results/:quizId" element={<QuizResults />} /> 
          <Route path="/admin" element={<ProtectedRoute><AdminQuizManager /></ProtectedRoute>} />
          <Route path="/edit-quiz/:quizId" element={<EditQuiz />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
