"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react'

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token.");
        }
    }, [token]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess("Password has been successfully reset. You can now login.");
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                setError(data.error || "Failed to reset password.");
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[400px] bg-transparent min-h-screen relative flex flex-col px-6 py-16 sm:py-20 shadow-sm">
            
            {/* Illustration */}
            <div className="w-full flex justify-center mb-8 h-40 relative">
                <Image
                    src="/assets/undraw/undraw_authentication_fsn5.svg"
                    alt="Security Illustration"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            {/* Headings */}
            <div className="mb-10">
                <h1 className="text-3xl font-display font-bold mb-3 tracking-tight text-primary">Reset Password</h1>
                <h2 className="text-sm text-gray-500 font-medium tracking-tight leading-snug">
                    Please enter your new password below.
                </h2>
            </div>

            {/* Form */}
            <form className="flex-1 flex flex-col" onSubmit={handleResetPassword}>
                <div className="space-y-4 mb-auto">
                    
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password"
                            className="w-full bg-transparent border border-gray-300 focus:border-black rounded-2xl px-5 py-4 text-sm text-black placeholder-gray-400 focus:outline-none transition-colors"
                            required
                            disabled={!token || !!success}
                        />
                    </div>

                    <div className="relative">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="w-full bg-transparent border border-gray-300 focus:border-black rounded-2xl px-5 py-4 text-sm text-black placeholder-gray-400 focus:outline-none transition-colors"
                            required
                            disabled={!token || !!success}
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                    {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                    {success && <div className="text-green-600 text-sm font-medium p-3 bg-green-50 rounded-lg border border-green-200">{success}</div>}
                    
                    <button
                        type="submit"
                        disabled={isLoading || !token || !!success}
                        className="w-full bg-primary text-white font-bold text-base rounded-2xl py-4 hover:bg-gray-900 transition-colors active:scale-[0.98] disabled:opacity-70"
                    >
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>

                    <button 
                        type="button"
                        onClick={() => router.push("/login")}
                        className="mt-4 text-sm text-gray-500 hover:text-black font-medium"
                    >
                        Back to Sign In
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-emerald-100 flex justify-center text-black font-sans">
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
