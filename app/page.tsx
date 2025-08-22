import Link from "next/link";

export default function Landing() {
  return (
    <div className="grid gap-8">
      <header className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-semibold">Cycling Club Dashboard</h1>
        <p className="mt-4 text-lg text-gray-600">
          Track your rides, compare with your club, and stay consistent.
        </p>
        <div className="mt-8">
          <Link href="/sign-in" className="inline-block rounded-xl px-5 py-3 bg-black text-white">
            Get started
          </Link>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        {[
          { t: "Fast auth", d: "Google, email OTP, or phone OTP" },
          { t: "Strava connect", d: "Pull your latest rides securely" },
          { t: "Filters", d: "By date range or by club" },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl bg-white p-6 shadow-sm border">
            <h3 className="font-semibold text-xl">{x.t}</h3>
            <p className="text-gray-600 mt-2">{x.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
