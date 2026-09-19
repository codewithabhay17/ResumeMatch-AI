import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reviewAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

function FloatingCard({ style, className, children }) {
  return (
    <div className={className} style={{
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(20px)",
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.8)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
      padding: "14px 18px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function HeroVisual() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480, height: 480, margin: "0 auto" }}>
      {/* Central 3D document */}
      <div className="animate-float" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -54%)" }}>
        <div style={{
          width: 160,
          height: 200,
          background: "white",
          borderRadius: 20,
          border: "1px solid #E7E5E2",
          boxShadow: "0 24px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
          padding: 20,
          transform: "perspective(800px) rotateY(-8deg) rotateX(4deg)",
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)", marginBottom: 8 }} />
            <div style={{ height: 8, background: "#E7E5E2", borderRadius: 4, marginBottom: 6 }} />
            <div style={{ height: 8, background: "#E7E5E2", borderRadius: 4, width: "70%" }} />
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: 6, background: i % 3 === 0 ? "#EDE9FF" : "#F0EEE9", borderRadius: 3, marginBottom: 8, width: i === 3 ? "80%" : "100%" }} />
          ))}
          <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
            {["React", "JS", "SQL"].map(t => (
              <span key={t} style={{ fontSize: 9, padding: "3px 8px", background: "#EDE9FF", color: "#6C5CE7", borderRadius: 6, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AI orb glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 200, height: 200,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Floating stats */}
      <FloatingCard className="animate-float-delayed" style={{ position: "absolute", top: 40, left: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #35B879, #5DD99A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#171717", fontFamily: "var(--font-display)" }}>ATS Score 94</div>
            <div style={{ fontSize: 11, color: "#8A8A8A" }}>Excellent</div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="animate-float" style={{ position: "absolute", top: 30, right: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#171717", fontFamily: "var(--font-display)" }}>87% Match</div>
            <div style={{ fontSize: 11, color: "#8A8A8A" }}>Top job fit</div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="animate-float-delayed" style={{ position: "absolute", bottom: 80, left: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #FF7A6B, #FFB3AB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#171717", fontFamily: "var(--font-display)" }}>12 Skills</div>
            <div style={{ fontSize: 11, color: "#8A8A8A" }}>Detected</div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="animate-float" style={{ position: "absolute", bottom: 60, right: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #F4A340, #F7C070)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#171717", fontFamily: "var(--font-display)" }}>3 Tips</div>
            <div style={{ fontSize: 11, color: "#8A8A8A" }}>AI recommendations</div>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
}

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    color: "#6C5CE7",
    bg: "#EDE9FF",
    title: "AI Resume Analysis",
    desc: "Get a comprehensive breakdown of your resume with ATS score, skill detection, and section-by-section improvement insights.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    color: "#35B879",
    bg: "#D6F5E5",
    title: "ATS Optimization",
    desc: "Identify missing keywords, formatting issues, and structure problems before your resume reaches a recruiter.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    color: "#FF7A6B",
    bg: "#FFE8E5",
    title: "Smart Job Matching",
    desc: "Discover opportunities ranked by how well your experience, skills, and background align with each role.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    color: "#F4A340",
    bg: "#FEF0D9",
    title: "Career Insights",
    desc: "Understand skill gaps, trending keywords in your field, and get a clear roadmap to your next career move.",
  },
];

const steps = [
  { num: "01", title: "Upload Resume", desc: "Drop your PDF or DOCX. We accept all common formats up to 5MB." },
  { num: "02", title: "AI Analyzes", desc: "Our AI reviews structure, skills, keywords, and measurable impact in seconds." },
  { num: "03", title: "Discover Matches", desc: "See curated job opportunities ranked by compatibility with your profile." },
  { num: "04", title: "Improve & Apply", desc: "Follow AI recommendations to strengthen your resume before applying." },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer @ Google",
    avatar: "PS",
    avatarColor: "#6C5CE7",
    quote: "ResuMatch AI helped me understand exactly why I was getting rejected. After following the recommendations, I landed interviews at 3 FAANG companies.",
  },
  {
    name: "Rahul Mehta",
    role: "Product Manager @ Flipkart",
    avatar: "RM",
    avatarColor: "#35B879",
    quote: "The ATS score analysis was eye-opening. I had no idea my resume had so many formatting issues that were hiding my experience from recruiters.",
  },
  {
    name: "Aisha Kapoor",
    role: "Data Scientist @ Microsoft",
    avatar: "AK",
    avatarColor: "#FF7A6B",
    quote: "The job matching feature alone is worth it. Instead of applying blindly, I could see exactly which roles matched my background and why.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    reviewAPI.getAll()
      .then((res) => setReviews(res.data?.data || []))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, []);

  const submitReview = async () => {
    if (!reviewComment.trim()) {
      setReviewError("Please write a comment");
      return;
    }
    setReviewSubmitting(true);
    setReviewError("");
    try {
      const res = await reviewAPI.create(reviewRating, reviewComment, reviewName || "Anonymous");
      setReviews((prev) => [res.data?.data, ...prev]);
      setShowReviewModal(false);
      setReviewComment("");
      setReviewRating(5);
      setReviewName("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit review. Please make sure you're logged in.";
      setReviewError(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, size = 20 }) => (
    <div style={{ display: "flex", gap: 4, cursor: onChange ? "pointer" : "default" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= value ? "#F4A340" : "none"}
          stroke={star <= value ? "#F4A340" : "#D1D1D1"}
          strokeWidth="1.5"
          onClick={() => onChange && onChange(star)}
          style={{ transition: "all 0.15s" }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", fontFamily: "var(--font-sans)" }}>
      {/* Nav */}
      <nav style={{
        background: "rgba(247,247,245,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #E7E5E2",
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 40px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#171717" }}>ResuMatch AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn-ghost" onClick={() => navigate("/login")}>Sign In</button>
          <button className="btn-primary" onClick={() => navigate("/register")} style={{ padding: "10px 20px", fontSize: 14 }}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,92,231,0.1) 0%, transparent 70%), #F7F7F5",
        padding: "80px 40px",
        maxWidth: 1200,
        margin: "0 auto",
      }} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#EDE9FF",
            border: "1px solid #D4CEFF",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6C5CE7" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6C5CE7", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              AI-POWERED CAREER INTELLIGENCE
            </span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#171717",
            marginBottom: 24,
            letterSpacing: "-0.03em",
          }}>
            Turn your resume into your next opportunity.
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#666666", marginBottom: 40, maxWidth: 480 }}>
            Analyze your resume, improve ATS compatibility, discover relevant jobs, and understand exactly how your skills match each opportunity.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => navigate("/register")} style={{ fontSize: 16, padding: "14px 28px" }}>
              Analyze My Resume
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button className="btn-secondary" onClick={() => navigate("/jobs")} style={{ fontSize: 16, padding: "14px 28px" }}>
              Explore Jobs
            </button>
          </div>

          <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 24 }}>
            <div>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#171717" }}>50K+</span>
              <div style={{ fontSize: 13, color: "#8A8A8A" }}>Resumes analyzed</div>
            </div>
            <div style={{ width: 1, height: 40, background: "#E7E5E2" }} />
            <div>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#171717" }}>94%</span>
              <div style={{ fontSize: 13, color: "#8A8A8A" }}>Average ATS score</div>
            </div>
            <div style={{ width: 1, height: 40, background: "#E7E5E2" }} />
            <div>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#171717" }}>3x</span>
              <div style={{ fontSize: 13, color: "#8A8A8A" }}>More interviews</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <HeroVisual />
        </div>
      </section>

      {/* Trusted by */}
      <section style={{ padding: "48px 40px", borderTop: "1px solid #E7E5E2", borderBottom: "1px solid #E7E5E2", background: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8A8A8A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24 }}>
            Built for students, graduates and professionals
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", alignItems: "center" }}>
            {["IIT Delhi", "IIM Bangalore", "BITS Pilani", "NIT Trichy", "Freshers", "Mid-level"].map((name) => (
              <span key={name} style={{ fontSize: 16, fontWeight: 600, color: "#B8B5AF", fontFamily: "var(--font-display)" }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: "#171717", marginBottom: 16, letterSpacing: "-0.02em" }}>
            Everything you need to land your next role
          </h2>
          <p style={{ fontSize: 17, color: "#666666", maxWidth: 520, margin: "0 auto" }}>
            Powerful AI tools that give you the insights and confidence to apply smarter.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} className="card card-hover" style={{ padding: 28 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#171717", marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "#666666" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 40px", background: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: "#171717", marginBottom: 16, letterSpacing: "-0.02em" }}>
              How it works
            </h2>
            <p style={{ fontSize: 17, color: "#666666" }}>Four simple steps to a stronger application.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ textAlign: "center", padding: "32px 20px", position: "relative" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 8px 24px rgba(108,92,231,0.25)",
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "white", fontSize: 14 }}>{step.num}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#171717", marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#666666" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: "#171717", letterSpacing: "-0.02em", marginBottom: 12 }}>
            Trusted by job seekers
          </h2>
          <p style={{ fontSize: 17, color: "#666666" }}>Real results from real people.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {testimonials.map((t) => (
            <div key={t.name} className="card" style={{ padding: 28 }}>
              <div style={{ display: "flex", marginBottom: 16, gap: 2 }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#F4A340" stroke="#F4A340" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "#444444", marginBottom: 20 }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#171717" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#8A8A8A" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= USER REVIEWS SECTION ========================= */}
      <section style={{ padding: "80px 40px", background: "white", borderTop: "1px solid #E7E5E2" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: "#171717", letterSpacing: "-0.02em", marginBottom: 12 }}>
              What Our Users Say
            </h2>
            <p style={{ fontSize: 17, color: "#666666", marginBottom: 24 }}>
              Hear from people who have used ResuMatch AI to boost their careers.
            </p>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login");
                } else {
                  setShowReviewModal(true);
                }
              }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px",
                background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(108,92,231,0.3)",
                transition: "all 0.2s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Write a Review
            </button>
          </div>

          {reviewsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#8A8A8A" }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#8A8A8A", fontSize: 15 }}>
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {reviews.map((r) => (
                <div key={r.id} style={{
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid #E7E5E2",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <StarRating value={r.rating} size={16} />
                    <span style={{ fontSize: 11, color: "#B8B5AF" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444444", marginBottom: 16 }}>
                    "{r.comment}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: `hsl(${(r.userName || "A").charCodeAt(0) * 15 % 360}, 55%, 55%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 700, fontSize: 13,
                    }}>
                      {(r.userName || "A").charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#171717" }}>{r.userName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowReviewModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 32,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#171717", marginBottom: 8 }}>
              Share Your Experience
            </h3>
            <p style={{ fontSize: 14, color: "#666666", marginBottom: 24 }}>
              Your review helps others discover ResuMatch AI.
            </p>

            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444444", display: "block", marginBottom: 6 }}>Your Name</label>
              <input
                type="text"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "1px solid #E7E5E2",
                  borderRadius: 10, fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Rating */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444444", display: "block", marginBottom: 8 }}>Rating</label>
              <StarRating value={reviewRating} onChange={setReviewRating} size={28} />
            </div>

            {/* Comment */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444444", display: "block", marginBottom: 6 }}>Your Review</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "1px solid #E7E5E2",
                  borderRadius: 10, fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {reviewError && (
              <p style={{ fontSize: 13, color: "#E53E3E", marginBottom: 12 }}>{reviewError}</p>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={submitReview}
                disabled={reviewSubmitting}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: reviewSubmitting ? "#B8B5AF" : "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: reviewSubmitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  padding: "12px 20px",
                  background: "#F7F7F5",
                  color: "#666666",
                  border: "1px solid #E7E5E2",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <section style={{
        padding: "80px 40px",
        background: "linear-gradient(135deg, #6C5CE7 0%, #8B7CF6 100%)",
        textAlign: "center",
      }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 800, color: "white", marginBottom: 16, letterSpacing: "-0.02em" }}>
          Ready to improve your next application?
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", marginBottom: 36 }}>
          Join thousands of job seekers who landed better interviews with ResuMatch AI.
        </p>
        <button className="btn-primary" onClick={() => navigate("/register")} style={{
          background: "white",
          color: "#6C5CE7",
          fontSize: 16,
          padding: "16px 36px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}>
          Get Started Free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: "#171717", padding: "40px 40px", color: "rgba(255,255,255,0.5)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ color: "white", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 15 }}>ResuMatch AI</span>
          </div>
          <div style={{ fontSize: 13 }}>© 2026 ResuMatch AI. This score is an estimate and does not guarantee employment.</div>
          <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
            <span style={{ cursor: "pointer" }}>Privacy</span>
            <span style={{ cursor: "pointer" }}>Terms</span>
            <span style={{ cursor: "pointer" }}>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
