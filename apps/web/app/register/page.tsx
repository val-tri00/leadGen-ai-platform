import Link from "next/link";
import { AuthForm } from "../components/auth-form";

export default function RegisterPage() {
  return (
    <main className="page compact-page">
      <section className="intro">
        <p className="eyebrow">Auth</p>
        <h1>Register.</h1>
        <p className="lede">Create a user through `/api/auth/register`, then continue to login.</p>
      </section>
      <AuthForm mode="register" />
      <Link className="text-link" href="/login">
        Already registered? Login.
      </Link>
    </main>
  );
}

