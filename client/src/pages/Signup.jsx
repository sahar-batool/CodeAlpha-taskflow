import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/api";

const validate = ({ name, email, password }) => {
  const errors = {};
  if (name.trim().length < 2 || name.trim().length > 50) errors.name = "Name must be 2 to 50 characters";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email";
  if (password.length < 8 || password.length > 72) errors.password = "Password must be 8 to 72 characters";
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = "Use at least one letter and one number";
  return errors;
};

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing work with your team."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Log in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label="Full name" name="name" autoComplete="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} error={errors.name} />
        <Input label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
        <Input label="Password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={handleChange} error={errors.password} />
        <Button type="submit" loading={submitting} className="w-full">Create account</Button>
      </form>
    </AuthLayout>
  );
}