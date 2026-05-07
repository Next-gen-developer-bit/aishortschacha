"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "./page.module.css";

const STYLES = [
  { id: "horror", name: "Horror", icon: "👻" },
  { id: "funny", name: "Funny", icon: "😂" },
  { id: "historical", name: "Historical", icon: "🏛️" },
  { id: "magical", name: "Magical", icon: "✨" },
];



export default function Home() {
  const [credits, setCredits] = useState(100);
  const [script, setScript] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [videoUrl, setVideoUrl] = useState(null);
  const [pollingJobId, setPollingJobId] = useState(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", user.id)
          .single();
          
        if (data) {
          setCredits(data.credits);
        }
      }
    };
    fetchProfile();
  }, [supabase]);

  useEffect(() => {
    let intervalId;
    if (pollingJobId) {
      intervalId = setInterval(async () => {
        const { data, error } = await supabase
          .from("video_generations")
          .select("status, video_url")
          .eq("id", pollingJobId)
          .single();

        if (data) {
          if (data.status === "completed" && data.video_url) {
            setVideoUrl(data.video_url);
            setMessage({ text: "Success! Your short is ready.", type: "success" });
            setIsLoading(false);
            setPollingJobId(null);
            setScript("");
            setSelectedStyle("");
          } else if (data.status === "failed") {
            setMessage({ text: "Generation failed. Credits refunded.", type: "error" });
            setIsLoading(false);
            setPollingJobId(null);
            // Re-fetch credits
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).single();
              if (profile) setCredits(profile.credits);
            }
          }
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollingJobId, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const COST_PER_GENERATION = 10;
  const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB (Vercel body limit is 4.5MB)

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please upload an image file (PNG, JPG, WEBP).', type: 'error' });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setMessage({ text: 'Image must be under 3MB.', type: 'error' });
      return;
    }
    setReferenceImagePreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result); // base64 data URL
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  };

  const removeImage = () => {
    setReferenceImage(null);
    setReferenceImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setVideoUrl(null);

    if (!script.trim()) {
      setMessage({ text: "Please enter a script or prompt.", type: "error" });
      return;
    }
    if (!selectedStyle) {
      setMessage({ text: "Please select a style.", type: "error" });
      return;
    }
    if (credits <= 0 || credits < COST_PER_GENERATION) {
      setMessage({ text: "Please contact the admin to top up your credits.", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        script,
        style: selectedStyle,
        timestamp: new Date().toISOString(),
        ...(referenceImage && { reference_image: referenceImage })
      };

      // Send network request via local proxy to avoid CORS completely
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Webhook submission failed");
      }

      const data = await response.json();
      
      if (data.job_id) {
        setPollingJobId(data.job_id);
        setMessage({ text: "Processing video... This may take a few minutes.", type: "success" });
        setCredits(prev => prev - COST_PER_GENERATION);
        removeImage();
        // Note: isLoading stays true during polling
      } else {
        throw new Error("No job ID returned");
      }

    } catch (error) {
      console.error(error);
      setMessage({ text: error.message || "Failed to connect to generation server.", type: "error" });
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>AI Shorts Gen</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className={styles.creditBadge}>
            <span className={styles.creditIcon}>🪙</span>
            <span>{credits} Credits</span>
          </div>
          <button 
            onClick={handleLogout} 
            style={{
              background: 'transparent', 
              color: '#ef4444', 
              border: '1px solid #ef4444', 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              cursor: 'pointer'
            }}
          >
            Log Out
          </button>
        </div>
      </header>

      <h1 className={styles.title}>Bring Your Ideas to Life</h1>
      <p className={styles.subtitle}>
        Generate stunning AI shorts from text instantly. Choose your style and watch the magic happen.
      </p>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="script">
            1. Enter your script or prompt
          </label>
          <textarea
            id="script"
            className={styles.textarea}
            placeholder="A magical forest where trees whisper ancient secrets..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>2. Choose a style</label>
          <div className={styles.grid}>
            {STYLES.map((style) => (
              <div
                key={style.id}
                className={`${styles.selectableCard} ${selectedStyle === style.id ? styles.selected : ""}`}
                onClick={() => !isLoading && setSelectedStyle(style.id)}
              >
                <span className={styles.cardIcon}>{style.icon}</span>
                <span className={styles.cardName}>{style.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>3. Add a reference image (optional)</label>
          {!referenceImagePreview ? (
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleImageDrop}
              onClick={() => !isLoading && document.getElementById('refImageInput').click()}
            >
              <div className={styles.dropZoneIcon}>🖼️</div>
              <p className={styles.dropZoneText}>Drag & drop an image here, or click to browse</p>
              <p className={styles.dropZoneHint}>PNG, JPG, WEBP • Max 3MB</p>
              <input
                id="refImageInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleImageSelect(e.target.files[0])}
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className={styles.imagePreviewWrapper}>
              <img src={referenceImagePreview} alt="Reference" className={styles.imagePreview} />
              <button
                type="button"
                className={styles.removeImageBtn}
                onClick={removeImage}
                disabled={isLoading}
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        <div className={styles.submitWrapper}>
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Generating...
              </>
            ) : (
              <>
                ✨ Generate Short
                <span className={styles.deductionText}>-{COST_PER_GENERATION} credits</span>
              </>
            )}
          </button>
        </div>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
      </form>

      {videoUrl && (
        <div className={styles.videoSection}>
          <h2 className={styles.videoTitle}>Your Generated Short</h2>
          <div className={styles.videoContainer}>
            <video src={videoUrl} controls className={styles.videoPlayer} autoPlay loop playsInline />
            <a href={videoUrl} download="ai_short.mp4" className={styles.downloadBtn}>
              ⬇️ Download Video
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
