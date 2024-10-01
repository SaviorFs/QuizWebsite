import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EditQuiz = () => {
  const { quizId } = useParams(); 
  const [quiz, setQuiz] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(300);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      const quizDocRef = doc(db, 'quizzes', quizId);
      const quizSnap = await getDoc(quizDocRef);
      if (quizSnap.exists()) {
        const quizData = quizSnap.data();
        setQuiz(quizData);
        setTitle(quizData.title);
        setDescription(quizData.description);
        setTimeLimit(quizData.timeLimit);
        setQuestions(quizData.questions);
      } else {
        alert('Quiz not found');
        navigate('/quizlist');
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    if (!title || !description || questions.length === 0) {
      alert('Please fill out all fields and add at least one question.');
      return;
    }
    const quizDocRef = doc(db, 'quizzes', quizId);
    await updateDoc(quizDocRef, { title, description, timeLimit, questions });
    alert('Quiz updated successfully');
    navigate('/quizlist');
  };

  if (!quiz) {
    return <div>Loading quiz data...</div>;
  }

  return (
    <div>
      <h1>Edit Quiz</h1>
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label>Time Limit (seconds):</label>
        <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
      </div>
      <div>
        <h3>Questions:</h3>
        {questions.map((question, index) => (
          <div key={index}>
            <input
              type="text"
              value={question.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              placeholder="Question Text"
            />
            <div>
              {question.options.map((option, optionIndex) => (
                <input
                  key={optionIndex}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const updatedOptions = [...question.options];
                    updatedOptions[optionIndex] = e.target.value;
                    handleQuestionChange(index, 'options', updatedOptions);
                  }}
                  placeholder={`Option ${optionIndex + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => setQuestions([...questions, { question: '', options: [] }])}>Add Question</button>
      </div>
      <button onClick={handleSave}>Save Quiz</button>
      <button onClick={() => navigate('/quizlist')}>Cancel</button>
    </div>
  );
};

export default EditQuiz;
