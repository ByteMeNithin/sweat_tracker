"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/dashboard` } });
  }

  async function sendEmailOtp() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/dashboard` } });
    setLoading(false);
    setMessage(error ? error.message : "Check your email for the magic link.");
  }

  async function sendPhoneOtp() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) setMessage(error.message); else setOtpSent(true);
  }

  async function verifyPhoneOtp() {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setLoading(false);
    setMessage(error ? error.message : "Signed in!");
    if (!error) location.href = "/dashboard";
  }

  return (
    <div className="grid gap-6 max-w-md mx-auto">
      <button onClick={signInWithGoogle} className="w-full rounded-xl bg-black text-white py-3">Continue with Google</button>

      <div className="rounded-2xl bg-white p-5 border shadow-sm">
        <h3 className="font-semibold">Email magic link</h3>
        <div className="mt-3 grid gap-3">
          <input className="border rounded-lg p-3" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <button onClick={sendEmailOtp} disabled={loading} className="rounded-lg bg-gray-900 text-white py-2">
            {loading ? "Sending..." : "Send link"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 border shadow-sm">
        <h3 className="font-semibold">Phone OTP</h3>
        <div className="mt-3 grid gap-3">
          <input className="border rounded-lg p-3" placeholder="+91XXXXXXXXXX" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          {!otpSent ? (
            <button onClick={sendPhoneOtp} disabled={loading} className="rounded-lg bg-gray-900 text-white py-2">Send OTP</button>
          ) : (
            <div className="grid gap-3">
              <input className="border rounded-lg p-3" placeholder="Enter OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} />
              <button onClick={verifyPhoneOtp} disabled={loading} className="rounded-lg bg-gray-900 text-white py-2">Verify & Sign in</button>
            </div>
          )}
        </div>
      </div>

      {message && <p className="text-sm text-gray-600 text-center">{message}</p>}
    </div>
  );
}
