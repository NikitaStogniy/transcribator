"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function TestLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDebugLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/debug-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success("Login successful!");
        // Если есть URL для редиректа - используем его
        if (data.redirectUrl) {
          console.log("Redirecting to:", data.redirectUrl);
          setTimeout(() => {
            window.location.href = data.redirectUrl;
          }, 1000);
        }
      } else {
        toast.error(`Login failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error during debug login:", error);
      toast.error("Login request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSimpleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          callbackUrl: "/dashboard", // Явно указываем callbackUrl
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success("Login successful!");
        // Перенаправляем в дашборд после успешного входа
        setTimeout(() => {
          window.location.href = data.redirectUrl || "/dashboard";
        }, 1000);
      } else {
        toast.error(`Login failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error during simple login:", error);
      toast.error("Login request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error checking session:", error);
      toast.error("Session check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Auth Debug</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDebugLogin}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Debug Login"}
            </button>

            <button
              onClick={handleSimpleLogin}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Simple Login"}
            </button>
          </div>

          <button
            onClick={handleSessionCheck}
            disabled={loading}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Check Session
          </button>
        </div>

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
