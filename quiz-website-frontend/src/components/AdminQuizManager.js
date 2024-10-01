import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AdminQuizManager = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(300);
  const [questions, setQuestions] = useState([]);
  const [resultDescription, setResultDescription] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState({ question: '', options: [], correctAnswer: null, explanation: '' }); 
  const [newOption, setNewOption] = useState('');
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().isAdmin) {
          setIsAdmin(true);
        } else {
          alert('You are not authorized to manage quizzes.');
          navigate('/quizlist');
        }
      }
    };

    const fetchQuizzes = async () => {
      const quizCollectionRef = collection(db, 'quizzes');
      const quizSnapshot = await getDocs(quizCollectionRef);
      const quizzesData = quizSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuizzes(quizzesData);
    };

    checkAdminStatus();
    fetchQuizzes();
  }, [navigate]);

  const handleAddOption = () => {
    if (newOption.trim() !== '') {
      setCurrentQuestion((prevQuestion) => ({
        ...prevQuestion,
        options: [...prevQuestion.options, newOption.trim()],
      }));
      setNewOption('');
    }
  };

  const handleAddQuestion = () => {
    if (currentQuestion.question.trim() !== '' && currentQuestion.options.length > 0 && currentQuestion.correctAnswer !== null) {
      setQuestions((prevQuestions) => [...prevQuestions, currentQuestion]);
      setCurrentQuestion({ question: '', options: [], correctAnswer: null, explanation: '' });
    } else {
      alert('Please fill out the question, options, and select a correct answer before adding the question.');
    }
  };

  const handleSaveQuiz = async () => {
    if (title.trim() === '' || description.trim() === '' || questions.length === 0) {
      alert('Please complete the quiz details and add at least one question.');
      return;
    }

    try {
      if (editingQuizId) {
        const quizDocRef = doc(db, 'quizzes', editingQuizId);
        await updateDoc(quizDocRef, { title, description, timeLimit, questions, resultDescription });
        alert('Quiz updated successfully');
        setQuizzes((prevQuizzes) =>
          prevQuizzes.map((quiz) => (quiz.id === editingQuizId ? { id: editingQuizId, title, description, timeLimit, questions, resultDescription } : quiz))
        );
      } else {
        const docRef = await addDoc(collection(db, 'quizzes'), { title, description, timeLimit, questions, resultDescription });
        alert('Quiz added successfully with ID: ' + docRef.id);
        setQuizzes((prevQuizzes) => [...prevQuizzes, { id: docRef.id, title, description, timeLimit, questions, resultDescription }]);
      }
      clearForm();
    } catch (error) {
      console.error('Error adding or updating quiz: ', error.message);
    }
  };

  const handleEditQuiz = async (quiz) => {
    try {
      setEditingQuizId(quiz.id);
      setTitle(quiz.title);
      setDescription(quiz.description);
      setTimeLimit(quiz.timeLimit);
      setQuestions(quiz.questions || []);
      setResultDescription(quiz.resultDescription || '');
    } catch (error) {
      console.error('Error loading quiz for editing:', error.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        const quizDocRef = doc(db, 'quizzes', quizId);
        await deleteDoc(quizDocRef);
        alert('Quiz deleted successfully!');
        setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));
      } catch (error) {
        console.error('Error deleting quiz:', error.message);
      }
    }
  };

  const clearForm = () => {
    setEditingQuizId(null);
    setTitle('');
    setDescription('');
    setTimeLimit(300);
    setQuestions([]);
    setResultDescription('');
    setCurrentQuestion({ question: '', options: [], correctAnswer: null, explanation: '' });
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <h2>{editingQuizId ? 'Edit Quiz' : 'Add a New Quiz'}</h2>
      <form>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quiz Title"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Quiz Description"
          required
        />
        <input
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
          placeholder="Time Limit (in seconds)"
          required
        />
        <textarea
          value={resultDescription}
          onChange={(e) => setResultDescription(e.target.value)}
          placeholder="Result Description (Optional)"
        />
        
        <hr />
        <h3>Add Question</h3>
        <input
          type="text"
          value={currentQuestion.question}
          onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, question: e.target.value }))}
          placeholder="Question Text"
          required
        />
        <textarea
          value={currentQuestion.explanation} // Input field for explanation
          onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, explanation: e.target.value }))}
          placeholder="Explanation for the question (Optional)"
        />
        <div>
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add Answer Option"
          />
          <button type="button" onClick={handleAddOption}>
            Add Option
          </button>
        </div>
        <ul>
          {currentQuestion.options.map((option, index) => (
            <li key={index}>
              {option}{' '}
              <button
                type="button"
                onClick={() => setCurrentQuestion((prev) => ({ ...prev, correctAnswer: index }))}
                style={{ color: currentQuestion.correctAnswer === index ? 'green' : 'black' }}
              >
                {currentQuestion.correctAnswer === index ? 'Correct Answer' : 'Set as Correct'}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={handleAddQuestion}>
          Add Question to Quiz
        </button>

        <button type="button" onClick={handleSaveQuiz} style={{ marginTop: '20px' }}>
          {editingQuizId ? 'Update Quiz' : 'Add Quiz'}
        </button>

        {editingQuizId && (
          <button type="button" onClick={clearForm} style={{ marginLeft: '20px' }}>
            Cancel Edit
          </button>
        )}
      </form>

      <hr />
      <h2>Existing Quizzes</h2>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id}>
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <button onClick={() => handleEditQuiz(quiz)} style={{ marginRight: '10px' }}>
              Edit
            </button>
            <button onClick={() => handleDeleteQuiz(quiz.id)} style={{ color: 'red' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminQuizManager;
