import React, { useState } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc } from 'firebase/firestore';

const AdminAddQuiz = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]); 
  const [message, setMessage] = useState(''); 

  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']); 
  const [correctAnswer, setCorrectAnswer] = useState(0); 

  
  const handleAddQuestion = (e) => {
    e.preventDefault(); 

    if (!currentQuestion || options.some((opt) => opt === '')) {
      setMessage('Please complete the question and all options.');
      return;
    }

    const newQuestion = {
      question: currentQuestion,
      options: [...options], 
      correctAnswer: correctAnswer, 
    };

    setQuestions([...questions, newQuestion]); 
    setCurrentQuestion(''); 
    setOptions(['', '', '', '']); 
    setCorrectAnswer(0); 
    setMessage('Question added successfully!');
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();

    if (!title || !description || questions.length === 0) {
      setMessage('Please complete the quiz title, description, and add at least one question.');
      return;
    }

    try {
      
      await addDoc(collection(db, 'quizzes'), {
        title,
        description,
        questions, 
      });

      setTitle('');
      setDescription('');
      setQuestions([]); 
      setMessage('Quiz added successfully!');
    } catch (error) {
      console.error('Error adding quiz:', error.message);
      setMessage('Error adding quiz. Please try again.');
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  return (
    <div>
      <h1>Add a New Quiz</h1>

      <form onSubmit={handleAddQuiz}>
        <div>
          <label>Quiz Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
            required
          />
        </div>

        <div>
          <label>Quiz Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quiz description"
            required
          />
        </div>

        <h3>Questions Added:</h3>
        {questions.length > 0 ? (
          <ul>
            {questions.map((q, index) => (
              <li key={index}>
                <strong>{q.question}</strong>
                <ul>
                  {q.options.map((opt, idx) => (
                    <li key={idx}>
                      {opt} {idx === q.correctAnswer ? '(Correct Answer)' : ''}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p>No questions added yet.</p>
        )}

        <button type="submit">Add Quiz</button>
      </form>

      <h2>Add Questions</h2>

      <div>
        <div>
          <label>Question</label>
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Enter question"
          />
        </div>

        <div>
          {options.map((option, index) => (
            <div key={index}>
              <label>Option {index + 1}</label>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <div>
          <label>Correct Answer</label>
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(parseInt(e.target.value))}
          >
            {options.map((_, index) => (
              <option key={index} value={index}>
                Option {index + 1}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={handleAddQuestion}>Add Question</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminAddQuiz;
