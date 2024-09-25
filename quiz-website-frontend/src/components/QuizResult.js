import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state; 

  return (
    <div>
      <h1>Quiz Results for {result.quizTitle}</h1>
      <h3>Score: {result.score} / {result.totalQuestions}</h3>

      <ul>
        {result.detailedResults.map((questionResult, index) => (
          <li key={index}>
            <h4>Question: {questionResult.question}</h4>
            <p>Your Answer: {questionResult.userAnswer === null ? 'No Answer' : questionResult.userAnswer}</p>
            <p>Correct Answer: {questionResult.correctAnswer}</p>
            <p style={{ color: questionResult.isCorrect ? 'green' : 'red' }}>
              {questionResult.isCorrect ? 'Correct' : 'Incorrect'}
            </p>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate('/quizlist')}>Back to Quiz List</button> 
    </div>
  );
};

export default QuizResults;
