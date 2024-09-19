import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import './App.css';
import logo from './assets/logo.png';
import close from './assets/close.png';
import loading from './assets/loading.gif';
import confetti from './assets/confetti.gif';

function App() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [hideQuestions, setHideQuestions] = useState(false); // State for hiding questions

  const disableScroll = () => {
    document.body.style.overflow = 'hidden'; // Disable scrolling
  };

  const enableScroll = () => {
    document.body.style.overflow = 'auto'; // Enable scrolling
  };

  const mockData = {
    title: `Introductory Calculus: Oxford Mathematics 1st Year Student Lecture`,
    summary: `In this introductory calculus lecture, Dr. Dan Ciubotaru provides an overview of the course syllabus, which includes differential equations, integration, line and double integrals, and calculus of functions in two variables. The lecture covers practical course information, such as lecture timings and problem sheets, and introduces basic concepts in differential equations and integration techniques. Examples from physics and engineering are provided to illustrate the application of differential equations. The lecture concludes with a detailed review of integration by parts and recursive formulas.`,
    keypoints: [
      { category: 'Course Structure', content: ["16 lectures and multiple problem sheets", "Lectures on Mondays and Wednesdays at 10 am", "Lecture notes and reading materials available online"] },
      { category: 'Syllabus Overview', content: ["First half: Differential equations (ODEs and PDEs)", "Second half: Line and double integrals, calculus of functions in two variables", "Key topics: Integration techniques, Taylor’s theorem, critical points, and Lagrange multipliers"] },
      { category: 'Application Examples', content: ["Newton’s second law in mechanics", "RLC circuits in electrical engineering", "Radioactive decay as a differential equation example"] },
      { category: 'Integration Techniques', content: ["Review of integration by parts", "Recursive formulas for challenging integrals", "Separation of variables for solving differential equations"] }
    ],
    quiz: [
      {
        question: `What are ordinary differential equations (ODEs)?`,
        answers: [
          { answer: '"ODEs involve integrals of functions.', isCorrect: false },
          { answer: 'ODEs involve derivatives with respect to multiple variables.', isCorrect: false },
          { answer: 'ODEs involve derivatives with respect to one variable.', isCorrect: true }
        ],
      },
      {
        question: `Give an example of a differential equation in mechanics.`,
        answers: [
          { answer: 'Newton`s second law, expressed as a second - order differential equation.', isCorrect: true },
          { answer: 'Ohm`s law of electrical circuits.', isCorrect: false },
          { answer: 'Pythagoras` theorem.', isCorrect: false }
        ],
      },
      {
        question: `What is the importance of integration by parts?`,
        answers: [
          { answer: 'It simplifies the process of solving integrals that are products of functions.', isCorrect: true },
          { answer: 'It is used to solve quadratic equations.', isCorrect: false },
          { answer: 'It is only useful for solving linear equations.', isCorrect: false }
        ],
      },
      {
        question: `What is the book recommended for reading in this course?`,
        answers: [
          { answer: 'Stewart`s Calculus.', isCorrect: false },
          { answer: 'Thomas` Calculus', isCorrect: false },
          { answer: 'Mary Boas`s "Mathematical Methods in Physical Sciences".', isCorrect: true }
        ],
      },
      {
        question: `What is the simplest kind of ordinary differential equation?`,
        answers: [
          { answer: 'dy/dx = f(x)', isCorrect: true },
          { answer: 'd^2y/dx^2 = f(x)', isCorrect: false },
          { answer: 'dy/dx = b(y)', isCorrect: false }
        ],
      },
      {
        question: `What are the types of integrals covered in this lecture?`,
        answers: [
          { answer: 'Single and triple integrals.', isCorrect: false },
          { answer: 'Polar and spherical integrals.', isCorrect: false },
          { answer: 'Definite and indefinite integrals.', isCorrect: true }
        ],
      },
      {
        question: `What technique is used to solve ODEs like dy/dx = a(x)b(y)?`,
        answers: [
          { answer: 'Integration by substitution.', isCorrect: false },
          { answer: 'Separation of variables.', isCorrect: true },
          { answer: 'Exact differentials.', isCorrect: false }
        ],
      },
      {
        question: `How should we approach problems with functions in differential equations that are not zero?`,
        answers: [
          { answer: 'By being cautious when dividing by the function.', isCorrect: true },
          { answer: 'By ignoring those functions.', isCorrect: false },
          { answer: 'By assuming they are always zero.', isCorrect: false }
        ],
      }
    ],
  };

  // Fetch the data from the server using 'id'
  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5000/api/data/${id}`)
        .then((response) => setData(response.data))
        .catch((error) => {
          console.error('Error fetching data:', error);
          // Use mock data if there is an error
          setData(mockData);
        });
    } else {
      // Use mock data if no ID is provided
      navigate('/1');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  // Handle swipe navigation for mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => nextQuestion(),
    onSwipedRight: () => prevQuestion(),
    trackMouse: true, // Enables swiping on desktop using a mouse
  });

  // Navigate to the next question
  const nextQuestion = () => {
    if (currentQuestionIndex < data.quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to the previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handle answer selection and show congratulations after all answers are chosen
  const handleAnswerSelect = (answer, answerIndex) => {
    const questionIndex = currentQuestionIndex;
    if (selectedAnswers[questionIndex] == null) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: { selected: answerIndex, isCorrect: answer.isCorrect === '1' },
      });

      // Check if all questions have been answered
      if (Object.keys(selectedAnswers).length === data.quiz.length - 1) {
        setTimeout(() => {
          setHideQuestions(true);
        }, 1000); // Hide questions and show "Congratulations!" after 1 second
      }
    }
  };

  // Handle clicking on a dot to navigate to the corresponding question
  const handleDotClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Copy summary to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(data.summary);
    // alert('Summary copied to clipboard!');
  };

  const handleOpenPopup = () => {
    disableScroll();
    setShowQuiz(true);
  };

  // Close the quiz popup
  const handleClosePopup = () => {
    enableScroll();
    setShowQuiz(false);
    setHideQuestions(false); // Reset the state for hiding questions
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
  };

  

  return (
    <div className="App">
      <div className='top-block'>
        <div className='top-text'>
          <div className="logo-text">
            <img src={logo} className="app-logo" alt="logo" />
            <p style={{ fontSize: "20", fontWeight: "400" }}>Note IA</p>
          </div>
          <div class="try-button-container">
            <button class="orange-button" onClick={() => window.location.href = 'https://apps.apple.com/app/id6642670245'}>Try for free</button>
          </div>
        </div>
      </div>

      {data ? (
        <>
          <div className='content-wrapper'>
            <p className='headers'>{data.title}</p>
            <p className='headers' style={{ lineHeight: "0", marginTop: "40px" }}>Abstract summary</p>
            <p style={{ fontSize: "20px", fontWeight: "300", border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "12px", padding: "10px" }}>{data.summary}</p>

            <div className="button-container">
              <button className="button" onClick={handleOpenPopup}>📝 Take a quiz</button>
              <button className="button" onClick={handleCopy}>📋 Copy summary</button>
            </div>

            <p className='headers' style={{ lineHeight: "0", marginTop: "40px" }}>Key points</p>
            <div className="keypoints">
              {data.keypoints.map((keypoint, index) => (
                <div key={index} className="keypoint-category">
                  <p style={{ fontSize: "20", fontWeight: "300", color: "#ff3d00" }}>{keypoint.category}</p>
                  <ul>
                    {keypoint.content.map((point, idx) => (
                      <li key={idx} style={{ fontSize: "20", fontWeight: "300" }}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginTop: '250px' }}>
            <img src={loading} alt="loading" />
          </div>
        </>
      )}
      {/* Quiz Popup */}
      {showQuiz && (
        <div className="popup-container">
          <div className="quiz-popup" {...handlers}>
            <button className="close-button" onClick={handleClosePopup}><img src={close} className="close-image" alt="close" /></button>
            {!hideQuestions ? (
              <>
                <p>{data.quiz[currentQuestionIndex].question}</p>

                <ul>
                  {data.quiz[currentQuestionIndex].answers.map((answer, index) => {
                    const isCorrectAnswer = answer.isCorrect === true;
                    const isSelected = selectedAnswers[currentQuestionIndex]?.selected === index;
                    const wasAnswered = selectedAnswers[currentQuestionIndex] != null;

                    return (
                      <li
                        key={index}
                        className={`answer ${wasAnswered
                          ? isCorrectAnswer
                            ? 'correct'
                            : isSelected
                              ? 'wrong'
                              : ''
                          : ''
                          }`}
                        onClick={() => handleAnswerSelect(answer, index)}
                      >
                        <div className='answer-text'> <span>{answer.answer}</span> <span>{wasAnswered ? isCorrectAnswer ? '✅' : isSelected ? '❌' : '' : ''}</span></div>
                      </li>
                    );
                  })}
                </ul>

                {/* Pagination dots */}
                <div className="dots">
                  {data.quiz.map((_, index) => (
                    <span
                      key={index}
                      className={`dot ${currentQuestionIndex === index ? 'active' : ''}`}
                      onClick={() => handleDotClick(index)}
                    ></span>
                  ))}
                </div>
              </>
            ) : (
              <div className="congratulations">
                <img src={confetti} alt="confetti" style={{ height: '100px', width: '100px' }} />
                <p className='headers' style={{ lineHeight: '0' }}>Congratulations!</p>
                <p style={{ fontSize: "20", fontWeight: "300", lineHeight: '0' }}>The quiz is fully complete!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

