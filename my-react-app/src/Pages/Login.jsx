import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  function handleLogin(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    // Temporary login navigation.
    // We will add proper authentication later.
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/student");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-logo">
          <span>Q</span>
          <h2>QuizBuilder</h2>
        </div>

        <div className="auth-heading">
          <h1>Welcome Back!</h1>
          <p>Login to continue your learning journey.</p>
        </div>

        <form onSubmit={handleLogin}>

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
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <label>Login As</label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="auth-button">
            Login
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Create Account</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;