import styles from "./page.module.css";

export const metadata = {
  title: "About Us | AI Shorts Generator",
  description: "Learn more about AI Shorts Gen, the ultimate content creation platform for automated, premium quality short videos.",
};

export default function AboutUsPage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo} id="about-nav-logo">AI Shorts Gen</div>
        <nav className={styles.navLinks}>
          <a href="/" id="about-nav-home">Home</a>
          <a href="/about-us" id="about-nav-about" style={{ color: "var(--accent)" }}>About Us</a>
          <a href="/contact-us" id="about-nav-contact">Contact Us</a>
          <a href="/" className={styles.startBtn} id="about-nav-start">Start Creating</a>
        </nav>
      </header>

      <h1 className={styles.title} id="about-main-title">About Us</h1>
      <p className={styles.subtitle} id="about-main-subtitle">
        Empowering content creators to tell stories instantly through advanced generative AI.
      </p>

      <div className={styles.card} id="about-content-card">
        <section className={styles.section} id="about-section-who">
          <h2 className={styles.sectionTitle}>
            <span>🚀</span> Who We Are
          </h2>
          <p className={styles.text}>
            AI Shorts Gen is an innovative platform built specifically for content creators, marketers, and storytellers. We realize that crafting engaging visual stories can be resource-intensive and time-consuming. Our site leverages cutting-edge generative AI models to convert scripts and prompts into high-quality, stylized short-form videos in seconds.
          </p>
        </section>

        <section className={styles.section} id="about-section-creation">
          <h2 className={styles.sectionTitle}>
            <span>✨</span> Built for Content Creation
          </h2>
          <p className={styles.text}>
            Whether you want to create thrilling horror scenarios, historical anecdotes, magical fantasy tales, or hilarious comedic sketches, our engine is fine-tuned to produce content that stands out on TikTok, YouTube Shorts, and Instagram Reels. Simply type your prompt, pick a visual style, and watch the system generate immersive video contents.
          </p>
        </section>

        <section className={styles.section} id="about-section-mission">
          <h2 className={styles.sectionTitle}>
            <span>🎯</span> Our Mission
          </h2>
          <p className={styles.text}>
            We believe that great storytelling shouldn't require Hollywood budgets or complex software. Our mission is to make advanced AI animation and video creation accessible, fun, and fast. By automating the technical steps of video rendering and styling, we give creators the freedom to focus entirely on what matters most: their ideas.
          </p>
        </section>
      </div>
    </main>
  );
}
