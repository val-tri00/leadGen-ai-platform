"use client";

import Link from "next/link";
import { ProtectedRoute } from "../components/protected-route";
import { GenerateRunForm } from "../components/leadgen/generate-run-form";

export default function GeneratePage() {
  return (
    <ProtectedRoute>
      <main className="page">
        <section className="intro">
          <p className="eyebrow">Generate Leads</p>
          <h1>Create a lead generation run.</h1>
          <p className="lede">Submit clear criteria and follow the async pipeline as it moves through each step.</p>
          <div className="action-row">
            <Link className="button-link secondary" href="/runs">
              View runs
            </Link>
          </div>
        </section>

        <GenerateRunForm />
      </main>
    </ProtectedRoute>
  );
}
