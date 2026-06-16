import styles from "./page.module.css";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Us | AI Shorts Generator",
  description: "Get in touch with AI Shorts Gen. We're here to answer your questions and assist with your content creation needs.",
};

export default function ContactUsPage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo} id="contact-nav-logo">AI Shorts Gen</div>
        <nav className={styles.navLinks}>
          <a href="/" id="contact-nav-home">Home</a>
          <a href="/about-us" id="contact-nav-about">About Us</a>
          <a href="/contact-us" id="contact-nav-contact" style={{ color: "var(--accent)" }}>Contact Us</a>
          <a href="/" className={styles.startBtn} id="contact-nav-start">Start Creating</a>
        </nav>
      </header>

      <h1 className={styles.title} id="contact-main-title">Contact Us</h1>
      <p className={styles.subtitle} id="contact-main-subtitle">
        Have questions or need support? Reach out to us directly.
      </p>

      <div className={styles.grid}>
        {/* Contact Info Card */}
        <div className={styles.card} id="contact-info-card">
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "1.5rem" }}>Contact Information</h2>
          <div className={styles.infoSection}>
            <div className={styles.infoItem} id="contact-info-name">
              <span className={styles.icon}>👤</span>
              <div>
                <div className={styles.infoLabel}>Name</div>
                <div className={styles.infoVal}>Charles son</div>
              </div>
            </div>

            <div className={styles.infoItem} id="contact-info-address">
              <span className={styles.icon}>📍</span>
              <div>
                <div className={styles.infoLabel}>Address</div>
                <div className={styles.infoVal}>4054 des moines drive, Stockton, CA 95209</div>
              </div>
            </div>

            <div className={styles.infoItem} id="contact-info-phone">
              <span className={styles.icon}>📞</span>
              <div>
                <div className={styles.infoLabel}>Phone</div>
                <div className={styles.infoVal}>+1 (209) 276-6316</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <ContactForm />
      </div>
    </main>
  );
}
