import Link from "next/link";
import { AuthForm } from "../components/auth-form";

export default function LoginPage() {
  return (
    <main className="page compact-page">
      <section className="intro">
        <p className="eyebrow">Auth</p>
        <h1>Login.</h1>
        <p className="lede">Submit credentials through `/api/auth/login` and open the protected dashboard.</p>
      </section>
      <AuthForm mode="login" />
      <Link className="text-link" href="/register">
        Need an account? Register.
      </Link>
    </main>
  );
}

