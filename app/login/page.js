"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "./page.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setMessage({ 
        text: "Success! You are now signed up. You can log in.", 
        type: "success" 
      });
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>AI Shorts Gen</h1>
        <p className={styles.subtitle}>Sign in to access your credits</p>

        <form>
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

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.primaryBtn} 
              onClick={handleLogin}
              disabled={isLoading}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className={styles.secondaryBtn} 
              onClick={handleSignUp}
              disabled={isLoading}
            >
              Create Account
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
