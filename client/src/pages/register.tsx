import { useState } from "react";
import { useRegister } from "@refinedev/core";

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const { mutate: register } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ name, email, password, role });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign Up</h1>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Sign Up</button>
      <p>Already have an account? <a href="/login">Sign in</a></p>
    </form>
  );
};