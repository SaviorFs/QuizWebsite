import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase'; 
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [previousResults, setPreviousResults] = useState([]);
  const [pausedQuizzes, setPausedQuizzes] = useState({});
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

    const fetchPreviousResults = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.quizzesCompleted) {
            setPreviousResults(data.quizzesCompleted);
          }
        }
      }
    };

    const fetchPausedQuizzes = async () => {
      const user = auth.currentUser;
      if (user) {
        const pausedRef = collection(db, 'users', user.uid, 'quizProgress');
        const pausedSnapshot = await getDocs(pausedRef);
        let pausedData = {};
        pausedSnapshot.forEach(doc => {
          pausedData[doc.id] = doc.data(); 
        });
        setPausedQuizzes(pausedData); 
      }
    };

    fetchQuizzes();
    fetchPreviousResults();
    fetchPausedQuizzes();
  }, []);

  return (
    <div>
      <h2>Available Quizzes</h2>
      <ul>
        {quizzes.map(quiz => (
          <li key={quiz.id}>
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>

            {pausedQuizzes[quiz.id] ? (
              <button onClick={() => navigate(`/quiz/${quiz.id}`)}>Resume Quiz</button> 
            ) : (
              <button onClick={() => navigate(`/quiz/${quiz.id}`)}>Take Quiz</button> 
            )}
          </li>
        ))}
      </ul>

      <h2>Previous Quiz Results</h2>
      <ul>
        {previousResults.length > 0 ? (
          previousResults.map((result, index) => (
            <li key={index}>
              <strong>{result.quizTitle}</strong> - Score: {result.score} / {result.totalQuestions} 
              (Completed on: {new Date(result.dateCompleted).toLocaleDateString()})
            </li>
          ))
        ) : (
          <p>No previous results found.</p>
        )}
      </ul>
    </div>
  );
};

export default QuizList;
