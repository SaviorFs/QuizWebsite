import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom'; 

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      const quizCollectionRef = collection(db, 'quizzes');
      const quizSnapshot = await getDocs(quizCollectionRef);
      const quizzesData = quizSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuizzes(quizzesData);
    };

    fetchQuizzes();
  }, []);

  return (
    <div>
      <h2>Available Quizzes</h2>
      <ul>
        {quizzes.map(quiz => (
          <li key={quiz.id}>
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
        
            <button onClick={() => navigate(`/quiz/${quiz.id}`)}>Take Quiz</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
