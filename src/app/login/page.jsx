import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const page = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-slate-800 dark:text-blue-100 mb-6">
            Scope-Creep Analyser
          </h1>
          <p className="text-xl text-slate-600 dark:text-blue-300">
            Track and manage project scope changes effectively. Stay on top of
            your project requirements.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-blue-100 mb-2">
              Scope-Creep Analyser
            </h1>
            <p className="text-slate-600 dark:text-blue-300">
              Welcome back! Please login to continue.
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-blue-200 dark:border-blue-800">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center">
                Login
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-blue-200">
                  Username
                </label>
                <Input
                  placeholder="Enter your username"
                  className="h-11"
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-blue-200">
                  Password
                </label>
                <Input
                  placeholder="Enter your password"
                  className="h-11"
                  type="password"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-slate-600 dark:text-blue-300">
                    Remember me
                  </span>
                </label>
                <Link
                  href="#"
                  className="text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                Login
              </Button>
              <div className="text-center text-sm text-slate-600 dark:text-blue-300">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Sign Up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default page;
