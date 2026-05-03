"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "../login/page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setIsLoading(true);

    try {
      // Pass the callback URL dynamically so it works on localhost AND vercel
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/update-password`,
      });

      if (error) {
        throw error;
      }

      setMessage({ 
        text: "Success! Check your email for the reset link.", 
        type: "success" 
      });
      setEmail("");
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>We will send a secure recovery link to your email.</p>

        <form onSubmit={handleReset}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.primaryBtn} 
              disabled={isLoading}
            >
              Send Reset Link
            </button>
            <button 
              type="button" 
              className={styles.secondaryBtn} 
              onClick={() => router.push("/login")}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </div>

          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
