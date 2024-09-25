import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

const TakeQuiz = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const navigate = useNavigate();

  const loadQuizProgress = async () => {
    const user = auth.currentUser;
    if (user) {
      const progressDocRef = doc(db, 'users', user.uid, 'quizProgress', id);
      const progressSnap = await getDoc(progressDocRef);

      if (progressSnap.exists()) {
        const savedProgress = progressSnap.data();
        setUserAnswers(savedProgress.userAnswers);
        setCurrentQuestionIndex(savedProgress.currentQuestionIndex);
        setHasProgress(true);
      } else {
        setHasProgress(false);
      }
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      const quizDocRef = doc(db, 'quizzes', id);
      const quizSnap = await getDoc(quizDocRef);
      if (quizSnap.exists()) {
        const quizData = quizSnap.data();
        if (quizData && quizData.questions && quizData.questions.length > 0) {
          setQuiz(quizData);
          loadQuizProgress();
        } else {
          alert("Quiz has no questions!");
          navigate('/quizlist');
        }
      } else {
        alert("Quiz not found!");
        navigate('/quizlist');
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  const startNewQuiz = () => {
    setUserAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setHasProgress(false);
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[questionIndex] = answerIndex;
    setUserAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (userAnswers[currentQuestionIndex] === null || userAnswers[currentQuestionIndex] === undefined) {
      alert('Please select an answer before moving on.');
      return;
    }
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userAnswers[currentQuestionIndex] === null || userAnswers[currentQuestionIndex] === undefined) {
      alert('Please answer the last question before submitting.');
      return;
    }

    let score = 0;
    const detailedResults = quiz.questions.map((question, index) => {
      const isCorrect = userAnswers[index] === question.correctAnswer;
      if (isCorrect) score += 1;

      return {
        question: question.question,
        userAnswer: question.options[userAnswers[index]],
        correctAnswer: question.options[question.correctAnswer],
        isCorrect,
      };
    });

    setScore(score);
    setShowResults(true);

    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        quizzesCompleted: arrayUnion({
          quizId: id,
          quizTitle: quiz.title,
          score: score,
          totalQuestions: quiz.questions.length,
          dateCompleted: new Date().toISOString(),
          detailedResults,
        }),
      });
    }

    const progressDocRef = doc(db, 'users', user.uid, 'quizProgress', id);
    await updateDoc(progressDocRef, {});
  };

  const handlePause = async () => {
    const user = auth.currentUser;
    if (user) {
      const progressDocRef = doc(db, 'users', user.uid, 'quizProgress', id);
      await updateDoc(progressDocRef, {
        userAnswers,
        currentQuestionIndex,
        quizId: id,
      });
    }
    navigate('/quizlist');
  };

  if (!quiz) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>

      {hasProgress && !showResults ? (
        <div>
          <button onClick={loadQuizProgress}>Resume Quiz</button>
          <button onClick={startNewQuiz}>Start New Quiz</button>
        </div>
      ) : !showResults ? (
        <form onSubmit={handleSubmit}>
          {quiz.questions && quiz.questions.length > 0 && (
            <div>
              <h3>{quiz.questions[currentQuestionIndex].question}</h3>
              {quiz.questions[currentQuestionIndex].options.map((option, optionIndex) => (
                <div key={optionIndex}>
                  <input
                    type="radio"
                    id={`q${currentQuestionIndex}o${optionIndex}`}
                    name={`question${currentQuestionIndex}`}
                    value={optionIndex}
                    checked={userAnswers[currentQuestionIndex] === optionIndex}
                    onChange={() => handleAnswerChange(currentQuestionIndex, optionIndex)}
                  />
                  <label htmlFor={`q${currentQuestionIndex}o${optionIndex}`}>
                    {option}
                  </label>
                </div>
              ))}

              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button type="button" onClick={handleNextQuestion}>
                  Next Question
                </button>
              ) : (
                <button type="submit">Submit Quiz</button>
              )}
            </div>
          )}
        </form>
      ) : (
        <div>
          <h2>Your Score: {score} / {quiz.questions.length}</h2>

          {quiz.questions.map((question, index) => (
            <div key={index}>
              <h3>{question.question}</h3>
              <p>Your Answer: {question.options[userAnswers[index]]}</p>
              <p>Correct Answer: {question.options[question.correctAnswer]}</p>
              {userAnswers[index] === question.correctAnswer ? (
                <p style={{ color: 'green' }}>Correct!</p>
              ) : (
                <p style={{ color: 'red' }}>Incorrect</p>
              )}
            </div>
          ))}

          <button onClick={() => navigate('/quizlist')}>Go Back to Quiz List</button>
        </div>
      )}

      {!showResults && (
        <button onClick={handlePause}>Pause Quiz</button>
      )}
    </div>
  );
};

export default TakeQuiz;
