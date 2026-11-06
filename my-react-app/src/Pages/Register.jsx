import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  function handleRegister(event) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    };

    const users = JSON.parse(
      localStorage.getItem("quizUsers") || "[]"
    );

    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existingUser) {
      alert("An account with this email already exists.");
      return;
    }

    localStorage.setItem(
      "quizUsers",
      JSON.stringify([...users, newUser])
    );

    alert("Registration successful! Please login.");
    navigate("/");
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-logo">
          <span>Q</span>
          <h2>QuizBuilder</h2>
        </div>

        <div className="auth-heading">
          <h1>Create Account</h1>
          <p>Join Quiz Builder and start learning.</p>
        </div>

        <form onSubmit={handleRegister}>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />

          <label>Register As</label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="auth-button">
            Create Account
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;