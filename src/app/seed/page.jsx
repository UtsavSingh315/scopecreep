"use client";

import { useState } from "react";
import { seedTestUser } from "@/lib/actions/seed";
import Link from "next/link";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSeed() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await seedTestUser();
      if (response.error) {
        setError(response.error);
      } else if (response.message) {
        setResult(response);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🌱 Seed Database
        </h1>
        <p className="text-gray-600 mb-6">Create test user in database</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            <p className="font-semibold">❌ Error</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
            <p className="font-semibold">✅ {result.message}</p>
            {result.user && (
              <div className="mt-2 text-sm space-y-1">
                <p>
                  <span className="font-semibold">ID:</span> {result.user.id}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {result.user.email}
                </p>
                <p>
                  <span className="font-semibold">Username:</span>{" "}
                  {result.user.username}
                </p>
                <p>
                  <span className="font-semibold">Password:</span>{" "}
                  {result.user.password}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
          {loading ? "🌱 Creating..." : "🌱 Create Test User"}
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">After seeding, you can:</p>
          <Link
            href="/login"
            className="block w-full text-center bg-blue-100 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-200 transition mb-2">
            → Go to Login
          </Link>
          <Link
            href="/signup"
            className="block w-full text-center bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition">
            → Go to Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
