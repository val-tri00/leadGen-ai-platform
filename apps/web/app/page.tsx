import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="intro">
        <p className="eyebrow">LeadGen AI</p>
        <h1>Auth shell for the local MVP.</h1>
        <p className="lede">
          Use the login, register, and dashboard routes to verify browser-to-gateway-to-identity auth flow.
        </p>
        <div className="action-row">
          <Link className="button-link" href="/login">
            Login
          </Link>
          <Link className="button-link secondary" href="/register">
            Register
          </Link>
        </div>
      </section>

      <section className="service-list" aria-label="Current MVP services">
        <article className="service-card">
          <span>Gateway routing</span>
          <strong>/api/auth/*</strong>
        </article>
        <article className="service-card">
          <span>Session storage</span>
          <strong>local MVP layer</strong>
        </article>
        <article className="service-card">
          <span>Protected route</span>
          <strong>/dashboard</strong>
        </article>
      </section>
    </main>
  );
}

