"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit} id="contact-form">
      <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "1.5rem" }}>Send a Message</h2>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="name">Your Name</label>
        <input
          type="text"
          id="name"
          className={styles.input}
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          className={styles.input}
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="message">Message</label>
        <textarea
          id="message"
          className={styles.textarea}
          placeholder="How can we help you..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
      </div>
      <button type="submit" className={styles.submitBtn} id="contact-submit-btn">
        ✉️ Send Message
      </button>

      {submitted && (
        <div className={`${styles.message} ${styles.success}`} id="contact-success-msg">
          Thank you! Your message has been sent successfully. We will get back to you shortly.
        </div>
      )}
    </form>
  );
}
