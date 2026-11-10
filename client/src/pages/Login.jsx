import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/api";

const validate = ({ email, password }) => {
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email";
  if (!password) errors.password = "Password is required";
  return errors;
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to your projects."
      footer={<>New here? <Link to="/signup" className="font-semibold text-brand-600 hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
        <Input label="Password" name="password" type="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={handleChange} error={errors.password} />
        <Button type="submit" loading={submitting} className="w-full">Log in</Button>
      </form>
    </AuthLayout>
  );
}