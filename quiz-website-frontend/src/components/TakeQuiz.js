import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

const TakeQuiz = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
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
        setTimeLeft(savedProgress.timeLeft || quiz.timeLimit);
        setHasProgress(true);
      } else {
        setHasProgress(false);
      }
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const quizDocRef = doc(db, 'quizzes', id);
      const quizSnap = await getDoc(quizDocRef);
      if (quizSnap.exists()) {
        const quizData = quizSnap.data();
        if (quizData && quizData.questions && quizData.questions.length > 0) {
          setQuiz(quizData);
          setTimeLeft(quizData.timeLimit);
          await loadQuizProgress();
          setLoading(false);
        } else {
          setErrorMessage('Quiz has no questions!');
          navigate('/quizlist');
        }
      } else {
        setErrorMessage('Quiz not found!');
        navigate('/quizlist');
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerExpired(true);
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  const startNewQuiz = () => {
    setUserAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setTimeLeft(quiz.timeLimit);
    setHasProgress(false);
    setTimerExpired(false);
    setErrorMessage('');
  };

  const resumeQuiz = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex);
    setErrorMessage('');
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[questionIndex] = answerIndex;
    setUserAnswers(updatedAnswers);
    setErrorMessage('');
  };

  const handleNextQuestion = () => {
    if (userAnswers[currentQuestionIndex] === null || userAnswers[currentQuestionIndex] === undefined) {
      setErrorMessage('Please select an answer before moving on.');
      return;
    }
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (userAnswers[currentQuestionIndex] === null || userAnswers[currentQuestionIndex] === undefined) {
      setErrorMessage('Please answer the last question before submitting.');
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
        explanation: question.explanation,
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
    const progressSnap = await getDoc(progressDocRef);

    if (progressSnap.exists()) {
      await deleteDoc(progressDocRef);
    } else {
      console.log('No progress document found, skipping deletion.');
    }
  };

  const handlePause = async () => {
    const user = auth.currentUser;
    if (user) {
      const progressDocRef = doc(db, 'users', user.uid, 'quizProgress', id);
      const progressSnap = await getDoc(progressDocRef);

      if (progressSnap.exists()) {
        await updateDoc(progressDocRef, {
          userAnswers,
          currentQuestionIndex,
          quizId: id,
          timeLeft,
        });
      } else {
        await setDoc(progressDocRef, {
          userAnswers,
          currentQuestionIndex,
          quizId: id,
          timeLeft,
        });
      }
    }
    navigate('/quizlist');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>
      <h3>Time Left: {formatTime(timeLeft)}</h3>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {hasProgress && !showResults ? (
        <div>
          <button onClick={resumeQuiz}>Resume Quiz</button>
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

              <div>
                {currentQuestionIndex > 0 && (
                  <button type="button" onClick={handlePreviousQuestion}>
                    Previous Question
                  </button>
                )}
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button type="button" onClick={handleNextQuestion}>
                    Next Question
                  </button>
                ) : (
                  <button type="submit">Submit Quiz</button>
                )}
              </div>
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
              <p><strong>Explanation:</strong> {question.explanation || 'No explanation provided.'}</p>
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
