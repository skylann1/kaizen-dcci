"use client";

import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [nik, setNik] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Forgot Password states
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotIdentifier, setForgotIdentifier] = useState("");
    const [forgotMessage, setForgotMessage] = useState("");
    const [isForgotLoading, setIsForgotLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                nik,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid NIK or Password");
                setIsLoading(false);
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsForgotLoading(true);
        setForgotMessage("");
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: forgotIdentifier }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setForgotMessage(data.message || "Email sent successfully.");
                setForgotIdentifier("");
            } else {
                setError(data.error || "Failed to process request.");
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-emerald-100 flex justify-center text-black font-sans">

            {/* Mobile-sized container */}
            <div className="w-full max-w-[400px] bg-transparent min-h-screen relative flex flex-col px-6 py-16 sm:py-20 shadow-sm">

                {/* Illustration */}
                <div className="w-full flex justify-center mb-8 h-60 relative">
                    <Image
                        src="/assets/undraw/undraw_google-docs_fwhy.svg"
                        alt="Sharing Ideas Illustration"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Headings */}
                <div className="mb-12 mt-12">
                    <h1 className="text-3xl font-display font-bold mb-3 tracking-tight text-primary">
                        {isForgotPassword ? "Reset Password" : "Let's sign you in."}
                    </h1>
                    <h2 className="text-lg text-gray-500 font-medium tracking-tight leading-snug">
                        {isForgotPassword 
                            ? "Enter your NIK or Email to receive a reset link."
                            : <React.Fragment>Welcome back<br />You've been missed!</React.Fragment>
                        }
                    </h2>
                </div>

                {/* Form */}
                {isForgotPassword ? (
                    <form className="flex-1 flex flex-col" onSubmit={handleForgotPassword}>
                        <div className="space-y-4 mb-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={forgotIdentifier}
                                    onChange={(e) => setForgotIdentifier(e.target.value)}
                                    placeholder="Employee ID (NIK) or Email"
                                    className="w-full bg-transparent border border-gray-300 focus:border-black rounded-2xl px-5 py-4 text-sm text-black placeholder-gray-400 focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col items-center gap-4">
                            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                            {forgotMessage && <div className="text-green-600 text-sm font-medium p-3 bg-green-50 rounded-lg border border-green-200">{forgotMessage}</div>}
                            <button
                                type="submit"
                                disabled={isForgotLoading}
                                className="w-full bg-primary text-white font-bold text-base rounded-2xl py-4 hover:bg-gray-900 transition-colors active:scale-[0.98] disabled:opacity-70"
                            >
                                {isForgotLoading ? "Sending..." : "Send Reset Link"}
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setIsForgotPassword(false); setError(""); setForgotMessage(""); }}
                                className="text-sm text-gray-500 hover:text-black font-medium mt-2"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <form className="flex-1 flex flex-col" onSubmit={handleLogin}>

                        <div className="space-y-4 mb-auto">
                        {/* NIK Input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={nik}
                                onChange={(e) => setNik(e.target.value)}
                                placeholder="Employee ID (NIK)"
                                className="w-full bg-transparent border border-gray-300 focus:border-black rounded-2xl px-5 py-4 text-sm text-black placeholder-gray-400 focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-transparent border border-gray-300 focus:border-black rounded-2xl px-5 py-4 text-sm text-black placeholder-gray-400 focus:outline-none transition-colors"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    {showPassword ? (
                                        <>
                                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                            <line x1="2" y1="2" x2="22" y2="22"></line>
                                        </>
                                    ) : (
                                        <>
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </>
                                    )}
                                </svg>
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => { setIsForgotPassword(true); setError(""); }}
                                className="text-sm text-primary hover:text-blue-700 font-bold"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-8 flex flex-col items-center gap-4">
                        {error && (
                            <div className="text-red-500 text-sm font-medium">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-bold text-base rounded-2xl py-4 hover:bg-gray-900 transition-colors active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </div>
                </form>

                {/* options login with google */}
                <div className="mt-6 flex flex-col items-center">
                    <div className="relative w-full flex items-center justify-center mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 transition-colors active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-700">Google</span>
                    </button>
                </div>
                </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;