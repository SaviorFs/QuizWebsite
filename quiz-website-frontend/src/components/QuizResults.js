import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const QuizResults = () => {
  const { quizId } = useParams();
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizResults = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const quizResult = data.quizzesCompleted.find(q => q.quizId === quizId);
          if (quizResult) {
            setResult(quizResult);
          }
        }
      }
    };

    fetchQuizResults();
  }, [quizId]);

  if (!result) {
    return <div>Loading results...</div>;
  }

  return (
    <div>
      <h1>Quiz Results for {result.quizTitle}</h1>
      <h3>Score: {result.score} / {result.totalQuestions}</h3>
      <p><strong>Quiz Description:</strong> {result.description || 'No description available.'}</p> 
      
      <ul>
        {result.detailedResults.map((questionResult, index) => (
          <li key={index} style={{ marginBottom: '20px' }}>
            <h4>Question: {questionResult.question}</h4>
            <p>Your Answer: {questionResult.userAnswer === null ? 'No Answer' : questionResult.userAnswer}</p>
            <p>Correct Answer: {questionResult.correctAnswer}</p>
            <p style={{ color: questionResult.isCorrect ? 'green' : 'red' }}>
              {questionResult.isCorrect ? 'Correct' : 'Incorrect'}
            </p>
            <p><strong>Explanation:</strong> {questionResult.explanation || 'No explanation provided.'}</p>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate('/quizlist')}>Back to Quiz List</button>
    </div>
  );
};

export default QuizResults;
