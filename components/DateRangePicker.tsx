"use client";
import { useState } from "react";

export default function DateRangePicker({ onChange }: { onChange: (v: {after?: string, before?: string}) => void }) {
  const [after, setAfter] = useState<string>("");
  const [before, setBefore] = useState<string>("");
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid">
        <label className="text-sm text-gray-600">From</label>
        <input type="date" value={after} onChange={(e)=>{setAfter(e.target.value); onChange({ after: e.target.value, before });}} className="border rounded-lg p-2" />
      </div>
      <div className="grid">
        <label className="text-sm text-gray-600">To</label>
        <input type="date" value={before} onChange={(e)=>{setBefore(e.target.value); onChange({ after, before: e.target.value });}} className="border rounded-lg p-2" />
      </div>
    </div>
  );
}
