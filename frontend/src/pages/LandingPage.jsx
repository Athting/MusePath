
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'
import ThreeDMusicVisualizer from '../components/ui/ThreeDMusicVisualizer'

const features = [
  {
    icon: '⚡',
    title: 'AI ROADMAPS',
    desc: 'Our advanced AI builds a custom monthly plan with weekly milestones, skill targets, and song recommendations tailored to you.'
  },
  {
    icon: '🎸',
    title: 'SONG DISCOVERY',
    desc: 'Discover the perfect songs to learn based on your mood, genre taste, and skill level. Every song is a lesson.'
  },
  {
    icon: '💿',
    title: 'VIDEO LESSONS',
    desc: 'YouTube tutorials hand-picked to match your current lesson, instrument, and difficulty — no more endless searching.'
  },
  {
    icon: '🔥',
    title: 'STREAK SYSTEM',
    desc: 'Stay motivated with daily streaks, XP points, achievements, and a progress heatmap that makes practice addictive.'
  },
  {
    icon: '📊',
    title: 'TRACKING PORTAL',
    desc: 'Visual dashboard showing completed lessons, practice hours, milestones, and your overall musical journey.'
  },
  {
    icon: '💀',
    title: 'DAILY MISSIONS',
    desc: 'Each week has a clear mission: specific techniques, songs, and exercises to keep you focused and progressing.'
  },
]

export default function LandingPage() {
  return (
    <div className="page-style-104">
      
      {/* Stark 3D Wireframe Wave Background in Hero */}
      <div className="page-style-105">
        <ThreeDMusicVisualizer isPlaying={false} speedMultiplier={1} />
        <div className="page-style-106" />
      </div>

      {/* Nav - Stark Black Navigation */}
      <nav className="page-style-107">
        <div className="flex items-center gap-3">
          <div className="page-style-108">
            M
          </div>
          <span className="page-style-109">
            MusePath
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/auth" className="page-style-110">Sign In</Link>
          <Link to="/auth" className="btn page-style-111" 
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#000000'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.color = '#000000'
          }}
          >
            JOIN CLUB
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero page-style-112" >
        <div className="page-style-113">

          <h1 className="hero-title" style={{ 
            fontFamily: 'var(--font-display)', 
            lineHeight: 0.95,
            fontSize: '100px', // Massive rock heading
            letterSpacing: '-0.01em',
            margin: 'var(--space-2) 0 var(--space-6)',
            textTransform: 'uppercase',
            fontWeight: 900,
            color: '#ffffff'
          }}>
            LEARN MUSIC.<br />
            YOUR WAY.
          </h1>

          <p className="hero-description page-style-114" >
            MusePath builds your custom heavy metal roadmap — AI learning paths, song discovery, 
            interactive video lessons, and raw daily missions to level up your craft.
          </p>

          <div className="hero-actions page-style-115" >
            <Link to="/auth" className="btn btn-primary page-style-116" 
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#000000'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.color = '#000000'
            }}
            >
              Start Free Riffing
              <ArrowRight size={14} className="page-style-117" />
            </Link>
          </div>

          {/* Trust signals */}
          <div className="page-style-121">
            {['No credit card required', 'Free to get started', 'Cancel anytime'].map((t) => (
              <div key={t} className="page-style-122">
                <CheckCircle size={12} color="#ffffff" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="page-style-123">
        <div className="page-style-124">
          <h2 className="page-style-125">
            Everything to <span className="page-style-126">Master</span> Shred Your Guitar
          </h2>
          <p className="page-style-127">
            No more boring tutorials. MusePath generates raw challenges to unlock your potential.
          </p>
        </div>

        <div className="page-style-128">
          {features.map((f) => (
            <div key={f.title} className="page-style-129"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#111111'
              e.currentTarget.style.borderColor = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0a0a0a'
              e.currentTarget.style.borderColor = '#222222'
            }}
            >
              <div className="page-style-130">
                {f.icon}
              </div>
              <h3 className="page-style-131">{f.title}</h3>
              <p className="page-style-132">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Atmospheric Quote Section */}
      <section className="page-style-133">
        <div className="page-style-134">
          <blockquote className="page-style-135">
            IF IT IS TOO LOUD, YOU ARE TOO OLD.
          </blockquote>
          <cite className="page-style-136">— HEAVY METAL CODE</cite>
        </div>
      </section>

      {/* Footer */}
      <footer className="page-style-137">
        <div className="flex items-center gap-3">
          <div className="page-style-138">
            M
          </div>
          <span className="page-style-139">
            MUSEPATH
          </span>
        </div>
        <p className="page-style-140">
          © 2026 MUSEPATH. SHRED THE WORLD.
        </p>
      </footer>

    </div>
  )
}

