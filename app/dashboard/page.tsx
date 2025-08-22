"use client";
import { useEffect, useMemo, useState } from "react";
import DateRangePicker from "@/components/DateRangePicker";

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-5 border shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [after, setAfter] = useState<string>("");
  const [before, setBefore] = useState<string>("");
  const [clubId, setClubId] = useState<string>("1276330");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true); setErr(null);
    const qs = new URLSearchParams();
    if (after) qs.set("after", after);
    if (before) qs.set("before", before);
    if (clubId) qs.set("club_id", clubId);
    const r = await fetch(`/api/strava/activities?${qs.toString()}`);
    if (!r.ok) { setErr(`Failed: ${r.status}`); setLoading(false); return; }
    const json = await r.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  const summary = useMemo(() => {
    const kms = data.reduce((acc, a) => acc + (a.distance || 0) / 1000, 0);
    const rides = data.length;
    const movingHours = data.reduce((acc, a) => acc + (a.moving_time || 0) / 3600, 0);
    return { kms: kms.toFixed(1), rides, hrs: movingHours.toFixed(1) };
  }, [data]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <a href="/api/strava/auth" className="rounded-xl bg-orange-600 text-white px-4 py-2">Connect with Strava</a>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <DateRangePicker onChange={({after, before})=>{ setAfter(after||""); setBefore(before||""); }} />
        <div className="grid">
          <label className="text-sm text-gray-600">Club ID (optional)</label>
          <input placeholder="e.g., 1276330" value={clubId} onChange={(e)=>setClubId(e.target.value)} className="border rounded-lg p-2" />
        </div>
        <button onClick={fetchData} className="rounded-xl bg-black text-white px-4 py-2">Refresh</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Total Distance" value={`${summary.kms} km`} />
        <Card title="Rides" value={summary.rides} />
        <Card title="Moving Time" value={`${summary.hrs} h`} />
      </div>

      {loading && <p>Loading rides…</p>}
      {err && <p className="text-red-600">{err}</p>}

      <div className="grid gap-3">
        {data.map((a) => (
          <div key={a.id} className="rounded-xl bg-white p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-sm text-gray-500">{new Date(a.start_date).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{(a.distance/1000).toFixed(1)} km</div>
                <div className="text-xs text-gray-500">Avg {Math.round((a.average_speed ?? 0) * 3.6)} km/h</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
