"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim();
    const cleanPassword = password;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!cleanPassword) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      console.log("LOGIN EMAIL:", cleanEmail);

      // Do NOT log the password.

      // ==========================================
      // SUPABASE LOGIN
      // ==========================================

      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      console.log("LOGIN ERROR:", loginError);
      console.log("LOGIN USER:", data?.user);
      console.log(
        "LOGIN SESSION:",
        data?.session ? "SESSION CREATED" : null
      );

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      if (!data.user || !data.session) {
        setError("Login succeeded but no authentication session was created.");
        setLoading(false);
        return;
      }

      // ==========================================
      // LOGIN SUCCESS
      // ==========================================

      console.log("LOGIN SUCCESS:", {
        userId: data.user.id,
        email: data.user.email,
      });

      router.replace("/chat");
      router.refresh();

    } catch (error) {
      console.error("LOGIN EXCEPTION:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to login."
      );

      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to access your AI customer support agent.
          </p>
        </div>

        {/* ==========================================
            FORM
        ========================================== */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={loading}
              className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-3
                text-sm
                text-gray-900
                outline-none
                transition
                focus:border-cyan-500
                focus:ring-2
                focus:ring-cyan-100
                disabled:bg-gray-100
              "
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={loading}
              className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-3
                text-sm
                text-gray-900
                outline-none
                transition
                focus:border-cyan-500
                focus:ring-2
                focus:ring-cyan-100
                disabled:bg-gray-100
              "
            />
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* LOGIN */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-lg
              bg-cyan-600
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-cyan-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
}