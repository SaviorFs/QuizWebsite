import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 
import { useParams } from 'react-router-dom'; 

const TakeQuiz = () => {
  const { id } = useParams(); 
  const [quiz, setQuiz] = useState(null); 
  const [userAnswers, setUserAnswers] = useState([]); 
  const [score, setScore] = useState(null); 

  useEffect(() => {
    const fetchQuiz = async () => {
      const quizDocRef = doc(db, 'quizzes', id);
      const quizSnap = await getDoc(quizDocRef);
      if (quizSnap.exists()) {
        setQuiz(quizSnap.data());
        setUserAnswers(new Array(quizSnap.data().questions.length).fill(null)); 
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswerChange = (questionIndex, answerIndex) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[questionIndex] = answerIndex;
    setUserAnswers(updatedAnswers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quiz) return;

    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        score += 1;
      }
    });
    setScore(score); 
  };

  if (!quiz) {
    return <div>Loading quiz...</div>; 
  }

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>
      
      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, questionIndex) => (
          <div key={questionIndex}>
            <h3>{question.question}</h3>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex}>
                <input
                  type="radio"
                  id={`q${questionIndex}o${optionIndex}`}
                  name={`question${questionIndex}`}
                  value={optionIndex}
                  checked={userAnswers[questionIndex] === optionIndex}
                  onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                />
                <label htmlFor={`q${questionIndex}o${optionIndex}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        ))}

        <button type="submit">Submit Quiz</button>
      </form>

      {score !== null && (
        <div>
          <h2>Your Score: {score} / {quiz.questions.length}</h2>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
