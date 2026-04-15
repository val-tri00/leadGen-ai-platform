const services = [
  "api-gateway",
  "identity-service",
  "leadgen-service",
  "pipeline-worker",
  "leadstore-service"
];

export default function Home() {
  return (
    <main className="page">
      <section className="intro">
        <p className="eyebrow">LeadGen AI</p>
        <h1>Portfolio foundation for AI-assisted lead generation.</h1>
        <p className="lede">
          The monorepo is ready for service boundaries, local containers, and
          incremental MVP development.
        </p>
      </section>

      <section className="service-list" aria-label="Current MVP services">
        {services.map((service) => (
          <article className="service-card" key={service}>
            <span>{service}</span>
            <strong>healthy placeholder</strong>
          </article>
        ))}
      </section>
    </main>
  );
}

