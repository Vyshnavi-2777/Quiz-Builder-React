import { useEffect, useState } from "react";
import "./App.css";

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const initialQuizzes = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    category: "Programming",
    difficulty: "Beginner",
    questions: [
      {
        text: "Which keyword declares a variable?",
        options: ["let", "print", "echo", "show"],
        answer: 0,
      },
      {
        text: "Which symbol checks strict equality?",
        options: ["=", "==", "===", "!="],
        answer: 2,
      },
      {
        text: "Which method prints to the console?",
        options: ["console.log()", "print()", "write()", "show()"],
        answer: 0,
      },
    ],
  },
  {
    id: 2,
    title: "HTML & CSS Basics",
    category: "Web Development",
    difficulty: "Beginner",
    questions: [
      {
        text: "What does HTML stand for?",
        options: [
          "HyperText Markup Language",
          "HighText Machine Language",
          "Home Tool Markup Language",
          "Hyper Tool Language",
        ],
        answer: 0,
      },
      {
        text: "Which CSS property changes text colour?",
        options: ["font-size", "color", "padding", "margin"],
        answer: 1,
      },
    ],
  },
];

export default function App() {
  const [users, setUsers] = useState(() => read("qb_users", []));
  const [quizzes, setQuizzes] = useState(() =>
    read("qb_quizzes", initialQuizzes)
  );
  const [results, setResults] = useState(() => read("qb_results", []));
  const [user, setUser] = useState(() => read("qb_current", null));

  const [page, setPage] = useState(() => {
    const savedUser = read("qb_current", null);
    return savedUser ? savedUser.role : "login";
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeResult, setActiveResult] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const [quizForm, setQuizForm] = useState({
    title: "",
    category: "Programming",
    difficulty: "Beginner",
    questions: [
      {
        text: "",
        options: ["", "", "", ""],
        answer: 0,
      },
    ],
  });

  useEffect(() => {
    localStorage.setItem("qb_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("qb_quizzes", JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem("qb_results", JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("qb_current", JSON.stringify(user));
    } else {
      localStorage.removeItem("qb_current");
    }
  }, [user]);

  const myResults = results.filter(
    (result) => result.studentId === user?.id
  );

  const totalQuestions = quizzes.reduce(
    (total, quiz) => total + quiz.questions.length,
    0
  );

  function updateForm(key, value) {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
  }

  // LOGIN AND REGISTRATION

  function authenticate(event) {
    event.preventDefault();
    setError("");

    if (mode === "register") {
      if (!form.name.trim()) {
        setError("Please enter your name.");
        return;
      }

      if (
        users.some(
          (u) => u.email.toLowerCase() === form.email.toLowerCase()
        )
      ) {
        setError("This email is already registered.");
        return;
      }

      const newUser = {
        id: Date.now(),
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };

      setUsers((old) => [...old, newUser]);
      setMode("login");
      setError("Account created! Please sign in.");
      return;
    }

    const found = users.find(
      (u) =>
        u.email.toLowerCase() === form.email.toLowerCase() &&
        u.password === form.password &&
        u.role === form.role
    );

    if (!found) {
      setError("Invalid details. Please register first.");
      return;
    }

    const safeUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
    };

    setUser(safeUser);
    setPage(found.role);
    setError("");
  }

  function logout() {
    setUser(null);
    setPage("login");
    setMode("login");
    setActiveQuiz(null);
    setActiveResult(null);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "student",
    });
  }

  // QUIZ CREATION AND EDITING

  function resetQuizForm() {
    setEditing(null);

    setQuizForm({
      title: "",
      category: "Programming",
      difficulty: "Beginner",
      questions: [
        {
          text: "",
          options: ["", "", "", ""],
          answer: 0,
        },
      ],
    });
  }

  function saveQuiz(event) {
    event.preventDefault();

    if (
      !quizForm.title.trim() ||
      quizForm.questions.some(
        (q) =>
          !q.text.trim() ||
          q.options.some((option) => !option.trim())
      )
    ) {
      alert("Please complete all quiz fields and options.");
      return;
    }

    if (editing !== null) {
      setQuizzes((old) =>
        old.map((quiz) =>
          quiz.id === editing
            ? { ...quizForm, id: editing }
            : quiz
        )
      );
    } else {
      setQuizzes((old) => [
        ...old,
        {
          ...quizForm,
          id: Date.now(),
        },
      ]);
    }

    resetQuizForm();
    setPage("admin");
  }

  function editQuiz(quiz) {
    setEditing(quiz.id);

    setQuizForm({
      title: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: [...q.options],
      })),
    });

    setPage("create");
  }

  function deleteQuiz(id) {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      setQuizzes((old) => old.filter((quiz) => quiz.id !== id));
    }
  }

  function changeQuestion(index, key, value) {
    setQuizForm((old) => ({
      ...old,
      questions: old.questions.map((q, i) =>
        i === index ? { ...q, [key]: value } : q
      ),
    }));
  }

  function changeOption(questionIndex, optionIndex, value) {
    setQuizForm((old) => ({
      ...old,
      questions: old.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((option, j) =>
                j === optionIndex ? value : option
              ),
            }
          : q
      ),
    }));
  }

  function addQuestion() {
    setQuizForm((old) => ({
      ...old,
      questions: [
        ...old.questions,
        {
          text: "",
          options: ["", "", "", ""],
          answer: 0,
        },
      ],
    }));
  }

  function removeQuestion(index) {
    setQuizForm((old) => ({
      ...old,
      questions: old.questions.filter((_, i) => i !== index),
    }));
  }

  // STUDENT QUIZ FUNCTIONS

  function startQuiz(quiz) {
    if (!quiz.questions.length) {
      alert("This quiz has no questions.");
      return;
    }

    setActiveQuiz(quiz);
    setAnswers({});
    setQuestionIndex(0);
    setActiveResult(null);
    setPage("take");
  }

  function submitQuiz() {
    const score = activeQuiz.questions.reduce(
      (total, question, index) =>
        total + (answers[index] === question.answer ? 1 : 0),
      0
    );

    const result = {
      id: Date.now(),
      quizTitle: activeQuiz.title,
      studentId: user.id,
      studentName: user.name,
      score,
      total: activeQuiz.questions.length,
      percentage: Math.round(
        (score / activeQuiz.questions.length) * 100
      ),
      date: new Date().toLocaleDateString(),
    };

    setResults((old) => [result, ...old]);
    setActiveResult(result);
    setActiveQuiz(null);
    setPage("result");
  }

  // NAVIGATION HEADER

  function Header() {
    return (
      <header className="navbar">
        <div
          className="brand"
          onClick={() => setPage(user?.role || "login")}
        >
          <span className="brand-icon">Q</span>
          Quiz<span>Builder</span>
        </div>

        <div className="nav-right">
          {user && (
            <>
              <span className="user-name">
                {user.name} · {user.role}
              </span>

              <button
                className="btn btn-outline"
                onClick={logout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>
    );
  }

  // LOGIN SCREEN

  if (!user) {
    return (
      <div className="auth-layout">
        <section className="auth-banner">
          <div className="brand brand-white">
            <span className="brand-icon">Q</span>
            QuizBuilder
          </div>

          <div className="banner-content">
            <span className="tag">LEARN · PRACTISE · GROW</span>

            <h1>Make every question a step forward.</h1>

            <p>
              Create quizzes, challenge yourself and track
              your learning progress in one place.
            </p>

            <div className="banner-points">
              <span>✦ Easy to use</span>
              <span>✦ Instant results</span>
              <span>✦ Learn anywhere</span>
            </div>
          </div>
        </section>

        <section className="auth-area">
          <form className="auth-card" onSubmit={authenticate}>
            <span className="eyebrow">
              {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </span>

            <h2>
              {mode === "login"
                ? "Sign in to QuizBuilder"
                : "Create your account"}
            </h2>

            <p className="muted">
              Enter your details to continue.
            </p>

            {error && <div className="notice">{error}</div>}

            {mode === "register" && (
              <label>
                Full name
                <input
                  value={form.name}
                  onChange={(e) =>
                    updateForm("name", e.target.value)
                  }
                  placeholder="Your name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateForm("email", e.target.value)
                }
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  updateForm("password", e.target.value)
                }
                placeholder="Enter password"
                minLength="6"
                required
              />
            </label>

            <label>
              {mode === "login" ? "Sign in as" : "Register as"}

              <select
                value={form.role}
                onChange={(e) =>
                  updateForm("role", e.target.value)
                }
              >
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
            </label>

            <button className="btn btn-primary full">
              {mode === "login" ? "Sign in →" : "Create account →"}
            </button>

            <p className="switch-text">
              {mode === "login"
                ? "Don't have an account?"
                : "Already registered?"}

              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
              >
                {mode === "login"
                  ? " Create account"
                  : " Sign in"}
              </button>
            </p>

            <small className="muted">
              College demo project · Data stored in this browser
            </small>
          </form>
        </section>
      </div>
    );
  }

  // MAIN APPLICATION

  return (
    <div className="app-shell">
      <Header />

      <main className="container">

        {/* ADMIN DASHBOARD */}

        {page === "admin" && user.role === "admin" && (
          <>
            <section className="hero">
              <div>
                <span className="eyebrow">ADMIN WORKSPACE</span>
                <h1>Welcome back, {user.name} 👋</h1>
                <p>Manage quizzes and monitor your platform.</p>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => {
                  resetQuizForm();
                  setPage("create");
                }}
              >
                ＋ Create quiz
              </button>
            </section>

            <section className="stats">
              <div className="stat">
                <span>📝</span>
                <p>Total quizzes</p>
                <strong>{quizzes.length}</strong>
              </div>

              <div className="stat">
                <span>❓</span>
                <p>Total questions</p>
                <strong>{totalQuestions}</strong>
              </div>

              <div className="stat">
                <span>👥</span>
                <p>Registered users</p>
                <strong>{users.length}</strong>
              </div>

              <div className="stat">
                <span>🏆</span>
                <p>Quiz attempts</p>
                <strong>{results.length}</strong>
              </div>
            </section>

            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR CONTENT</span>
                <h2>Manage quizzes</h2>
              </div>
            </div>

            {quizzes.length > 0 ? (
              <div className="grid">
                {quizzes.map((quiz) => (
                  <article className="quiz-card" key={quiz.id}>
                    <div className="quiz-symbol">✦</div>

                    <span className="category">
                      {quiz.category} · {quiz.difficulty}
                    </span>

                    <h3>{quiz.title}</h3>

                    <p className="muted">
                      {quiz.questions.length} questions
                    </p>

                    <div className="card-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => editQuiz(quiz)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={() => deleteQuiz(quiz.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">
                <h3>No quizzes yet</h3>
                <p>Create your first quiz.</p>
              </div>
            )}

            <div className="section-heading top-gap">
              <div>
                <span className="eyebrow">ACTIVITY</span>
                <h2>Recent attempts</h2>
              </div>
            </div>

            {results.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Quiz</th>
                      <th>Score</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.slice(0, 8).map((result) => (
                      <tr key={result.id}>
                        <td>{result.studentName}</td>
                        <td>{result.quizTitle}</td>
                        <td>
                          {result.score}/{result.total}
                        </td>
                        <td>{result.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">No quiz attempts yet.</p>
            )}
          </>
        )}

        {/* STUDENT DASHBOARD */}

        {page === "student" && user.role === "student" && (
          <>
            <section className="hero student-hero">
              <div>
                <span className="eyebrow">STUDENT SPACE</span>

                <h1>Ready to learn, {user.name}? ✨</h1>

                <p>
                  Choose a quiz, challenge yourself and keep improving.
                </p>
              </div>

              <div className="hero-star">✦</div>
            </section>

            <section className="stats three">
              <div className="stat">
                <span>📚</span>
                <p>Available quizzes</p>
                <strong>{quizzes.length}</strong>
              </div>

              <div className="stat">
                <span>✓</span>
                <p>Completed</p>
                <strong>{myResults.length}</strong>
              </div>

              <div className="stat">
                <span>↗</span>
                <p>Average score</p>
                <strong>
                  {myResults.length
                    ? Math.round(
                        myResults.reduce(
                          (sum, r) => sum + r.percentage,
                          0
                        ) / myResults.length
                      )
                    : 0}
                  %
                </strong>
              </div>
            </section>

            <div className="section-heading">
              <div>
                <span className="eyebrow">QUIZ LIBRARY</span>
                <h2>Explore available quizzes</h2>
              </div>
            </div>

            {quizzes.length > 0 ? (
              <div className="grid">
                {quizzes.map((quiz) => (
                  <article className="quiz-card" key={quiz.id}>
                    <div className="quiz-symbol">✦</div>

                    <span className="category">
                      {quiz.category} · {quiz.difficulty}
                    </span>

                    <h3>{quiz.title}</h3>

                    <p className="muted">
                      {quiz.questions.length} questions
                    </p>

                    <button
                      className="btn btn-primary full"
                      onClick={() => startQuiz(quiz)}
                    >
                      Start quiz →
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">
                <h3>No quizzes available</h3>
              </div>
            )}

            <div className="section-heading top-gap">
              <div>
                <span className="eyebrow">YOUR PROGRESS</span>
                <h2>Recent results</h2>
              </div>
            </div>

            {myResults.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {myResults.map((result) => (
                      <tr key={result.id}>
                        <td>{result.quizTitle}</td>
                        <td>
                          {result.score}/{result.total}
                        </td>
                        <td>{result.percentage}%</td>
                        <td>{result.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">
                Your results will appear here after completing a quiz.
              </p>
            )}
          </>
        )}

        {/* CREATE AND EDIT QUIZ */}

        {page === "create" && user.role === "admin" && (
          <>
            <button
              className="back"
              onClick={() => setPage("admin")}
            >
              ← Back to dashboard
            </button>

            <div className="section-heading">
              <div>
                <span className="eyebrow">QUIZ BUILDER</span>
                <h1>{editing !== null ? "Edit quiz" : "Create a new quiz"}</h1>
                <p className="muted">
                  Add quiz details and multiple-choice questions.
                </p>
              </div>
            </div>

            <form className="builder" onSubmit={saveQuiz}>
              <div className="panel">
                <h2>Quiz details</h2>

                <label>
                  Quiz title
                  <input
                    value={quizForm.title}
                    onChange={(e) =>
                      setQuizForm({
                        ...quizForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter quiz title"
                    required
                  />
                </label>

                <div className="two-cols">
                  <label>
                    Category
                    <select
                      value={quizForm.category}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          category: e.target.value,
                        })
                      }
                    >
                      <option>Programming</option>
                      <option>Web Development</option>
                      <option>Science</option>
                      <option>Mathematics</option>
                      <option>General Knowledge</option>
                      <option>Computer Networks</option>
                    </select>
                  </label>

                  <label>
                    Difficulty
                    <select
                      value={quizForm.difficulty}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          difficulty: e.target.value,
                        })
                      }
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="panel">
                <h2>Questions</h2>

                {quizForm.questions.map((q, i) => (
                  <div className="question-editor" key={i}>
                    <div className="question-title">
                      <strong>Question {i + 1}</strong>

                      {quizForm.questions.length > 1 && (
                        <button
                          type="button"
                          className="remove"
                          onClick={() => removeQuestion(i)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <label>
                      Question text
                      <input
                        value={q.text}
                        onChange={(e) =>
                          changeQuestion(i, "text", e.target.value)
                        }
                        placeholder="Type your question"
                        required
                      />
                    </label>

                    <div className="two-cols">
                      {q.options.map((option, j) => (
                        <label key={j}>
                          Option {String.fromCharCode(65 + j)}

                          <input
                            value={option}
                            onChange={(e) =>
                              changeOption(i, j, e.target.value)
                            }
                            placeholder={
                              "Option " + String.fromCharCode(65 + j)
                            }
                            required
                          />
                        </label>
                      ))}
                    </div>

                    <label>
                      Correct answer

                      <select
                        value={q.answer}
                        onChange={(e) =>
                          changeQuestion(
                            i,
                            "answer",
                            Number(e.target.value)
                          )
                        }
                      >
                        {q.options.map((option, j) => (
                          <option value={j} key={j}>
                            Option {String.fromCharCode(65 + j)}{" "}
                            {option || "(empty)"}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={addQuestion}
                >
                  ＋ Add question
                </button>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setPage("admin")}
                >
                  Cancel
                </button>

                <button className="btn btn-primary" type="submit">
                  {editing !== null ? "Save changes" : "Publish quiz"} →
                </button>
              </div>
            </form>
          </>
        )}

        {/* TAKE QUIZ */}

        {page === "take" && activeQuiz && (
          <>
            <button
              className="back"
              onClick={() => setPage("student")}
            >
              ← Exit quiz
            </button>

            <section className="take-card">
              <span className="eyebrow">
                {activeQuiz.category} · {activeQuiz.difficulty}
              </span>

              <h1>{activeQuiz.title}</h1>

              <div className="progress">
                <span
                  style={{
                    width:
                      ((questionIndex + 1) /
                        activeQuiz.questions.length) *
                        100 +
                      "%",
                  }}
                />
              </div>

              <div className="question-meta">
                QUESTION {questionIndex + 1} OF{" "}
                {activeQuiz.questions.length}
              </div>

              <h2>
                {activeQuiz.questions[questionIndex].text}
              </h2>

              <div className="answers">
                {activeQuiz.questions[questionIndex].options.map(
                  (option, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`answer ${
                        answers[questionIndex] === i
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setAnswers((old) => ({
                          ...old,
                          [questionIndex]: i,
                        }))
                      }
                    >
                      <span>{String.fromCharCode(65 + i)}</span>

                      {option}

                      {answers[questionIndex] === i && (
                        <b>✓</b>
                      )}
                    </button>
                  )
                )}
              </div>

              <div className="take-footer">
                <span className="muted">
                  {Object.keys(answers).length} of{" "}
                  {activeQuiz.questions.length} answered
                </span>

                <div className="form-actions">
                  {questionIndex > 0 && (
                    <button
                      className="btn btn-outline"
                      onClick={() =>
                        setQuestionIndex((i) => i - 1)
                      }
                    >
                      Previous
                    </button>
                  )}

                  {questionIndex <
                  activeQuiz.questions.length - 1 ? (
                    <button
                      className="btn btn-primary"
                      disabled={answers[questionIndex] === undefined}
                      onClick={() =>
                        setQuestionIndex((i) => i + 1)
                      }
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      disabled={
                        Object.keys(answers).length !==
                        activeQuiz.questions.length
                      }
                      onClick={() => {
                        if (
                          window.confirm("Submit your answers?")
                        ) {
                          submitQuiz();
                        }
                      }}
                    >
                      Submit quiz
                    </button>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* RESULTS PAGE */}

        {page === "result" && activeResult && (
          <section className="result-card">
            <div className="trophy">🏆</div>

            <span className="eyebrow">QUIZ COMPLETED</span>

            <h1>Well done, {user.name}!</h1>

            <p className="muted">{activeResult.quizTitle}</p>

            <div className="score-circle">
              <strong>{activeResult.percentage}%</strong>

              <span>
                {activeResult.score} out of {activeResult.total} correct
              </span>
            </div>

            <h3>
              {activeResult.percentage >= 80
                ? "Excellent work! 🎉"
                : activeResult.percentage >= 50
                ? "Good effort! Keep practising."
                : "Keep learning and try again!"}
            </h3>

            <div className="result-stats">
              <div>
                <strong>{activeResult.score}</strong>
                <span>Correct</span>
              </div>

              <div>
                <strong>
                  {activeResult.total - activeResult.score}
                </strong>
                <span>Incorrect</span>
              </div>

              <div>
                <strong>{activeResult.total}</strong>
                <span>Total</span>
              </div>
            </div>

            <button
              className="btn btn-primary full"
              onClick={() => setPage("student")}
            >
              Back to dashboard
            </button>
          </section>
        )}
      </main>

      <footer>
        © 2026 QuizBuilder · Learn something new every day.
      </footer>
    </div>
  );
}