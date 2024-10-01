import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [previousResults, setPreviousResults] = useState([]);
  const [pausedQuizzes, setPausedQuizzes] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
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

    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().isAdmin) {
          setIsAdmin(true);
        }
      }
    };

    fetchQuizzes();
    fetchPreviousResults();
    fetchPausedQuizzes();
    checkAdminStatus();
  }, []);

  const handleDelete = async (quizId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this quiz?');
    if (confirmDelete) {
      await deleteDoc(doc(db, 'quizzes', quizId));
      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
      alert('Quiz deleted successfully');
    }
  };

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

            {isAdmin && (
              <div>
                <button onClick={() => navigate(`/edit-quiz/${quiz.id}`)} style={{ marginRight: '10px' }}>
                  Edit Quiz
                </button>
                <button onClick={() => handleDelete(quiz.id)} style={{ color: 'red' }}>
                  Delete Quiz
                </button>
              </div>
            )}

            {previousResults.some(result => result.quizId === quiz.id) && (
              <button
                onClick={() => navigate(`/quiz-results/${quiz.id}`)}
                style={{ marginTop: '10px' }}
              >
                View Results
              </button>
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
