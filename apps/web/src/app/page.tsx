import { intakeForms } from "@/config/intake";

export default function Home() {
  const maintenance = intakeForms.maintenance;
  const renovations = intakeForms.renovations;

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-8">
      <h1 className="text-3xl font-semibold">Hampstead On Demand (V1)</h1>

      <section className="rounded-xl border p-5 space-y-2">
        <h2 className="text-xl font-medium">{maintenance.title}</h2>
        <p className="text-sm text-muted-foreground">{maintenance.subtitle}</p>
        <p className="text-sm">
          Questions: <strong>{maintenance.questions.length}</strong>
        </p>
        <p className="text-sm">
          Allowed postcodes:{" "}
          <strong>{maintenance.serviceArea.allowedPostcodes.join(", ")}</strong>
        </p>
      </section>

      <section className="rounded-xl border p-5 space-y-2">
        <h2 className="text-xl font-medium">{renovations.title}</h2>
        <p className="text-sm text-muted-foreground">{renovations.subtitle}</p>
        <p className="text-sm">
          Questions: <strong>{renovations.questions.length}</strong>
        </p>
        <p className="text-sm">
          Allowed postcodes:{" "}
          <strong>{renovations.serviceArea.allowedPostcodes.join(", ")}</strong>
        </p>
      </section>
    </main>
  );
}
