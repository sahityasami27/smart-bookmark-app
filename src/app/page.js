'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setChecking(false)
      }
    }
    checkSession()
  }, [])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
  }

  if (checking) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0a;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        .landing {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 2rem;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .glow {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 210, 0, 0.08) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 2rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .badge span {
          width: 6px;
          height: 6px;
          background: #FFD200;
          border-radius: 50%;
          display: inline-block;
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(3.5rem, 10vw, 7rem);
          font-weight: 800;
          line-height: 0.95;
          text-align: center;
          margin-bottom: 1.5rem;
          letter-spacing: -0.03em;
        }

        .hero-title .accent {
          color: #FFD200;
        }

        .hero-sub {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.45);
          text-align: center;
          max-width: 400px;
          line-height: 1.6;
          margin-bottom: 3rem;
        }

        .google-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FFD200;
          color: #0a0a0a;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          padding: 14px 28px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(255, 210, 0, 0.3);
        }

        .google-btn:active {
          transform: translateY(0);
        }

        .features {
          display: flex;
          gap: 2rem;
          margin-top: 4rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.35);
          font-size: 13px;
        }

        .feature-dot {
          width: 4px;
          height: 4px;
          background: #FFD200;
          border-radius: 50%;
        }
      `}</style>

      <div className="landing">
        <div className="bg-grid" />
        <div className="glow" />

        <div className="badge">
          <span></span>
          Your personal web
        </div>

        <h1 className="hero-title">
          Save links.<br />
          <span className="accent">Stay sharp.</span>
        </h1>

        <p className="hero-sub">
          A fast, private bookmark manager. Add links, access them anywhere, in real time.
        </p>

        <button className="google-btn" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="features">
          <div className="feature"><div className="feature-dot" /> Private by default</div>
          <div className="feature"><div className="feature-dot" /> Real-time sync</div>
          <div className="feature"><div className="feature-dot" /> No clutter</div>
        </div>
      </div>
    </>
  )
}