'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient() 
export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUser(session.user)

      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })
      setBookmarks(data || [])
      setLoading(false)

      const channel = supabase
        .channel('bookmarks-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookmarks' },
          (payload) => {
            console.log('realtime event:', payload)
            if (payload.eventType === 'INSERT') {
              setBookmarks((prev) => [payload.new, ...prev])
            } else if (payload.eventType === 'DELETE') {
              setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
            }
          }
        )
        .subscribe((status) => {
          console.log('subscription status:', status)
        })

      return () => supabase.removeChannel(channel)
    }

    init()
  }, [])

  const handleAdd = async () => {
    setError('')
    if (!title.trim() || !url.trim()) { setError('Both title and URL are required.'); return }
    let formattedUrl = url.trim()
    if (!/^https?:\/\//i.test(formattedUrl)) formattedUrl = 'https://' + formattedUrl
    setAdding(true)
    const { error: insertError } = await supabase.from('bookmarks').insert({ title: title.trim(), url: formattedUrl, user_id: user.id })
    if (insertError) setError(insertError.message)
    else { setTitle(''); setUrl('') }
    setAdding(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans, sans-serif', fontSize: '15px' }}>Loading...</div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #fff; font-family: 'DM Sans', sans-serif; }
        .dashboard { min-height: 100vh; background: #0a0a0a; }
        .bg-grid {
          position: fixed; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(10,10,10,0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 2rem;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .header-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.2rem;
          letter-spacing: -0.02em;
          display: flex; align-items: center; gap: 8px;
        }
        .header-logo .dot { color: #FFD200; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .user-pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .logout-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 6px 14px;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover { border-color: #ff4d4d; color: #ff4d4d; }
        .main { max-width: 680px; margin: 0 auto; padding: 3rem 1.5rem; position: relative; }
        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
        }
        .page-title .accent { color: #FFD200; }
        .page-sub { color: rgba(255,255,255,0.3); font-size: 14px; margin-bottom: 2.5rem; }
        .form-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .form-row { display: flex; flex-direction: column; gap: 10px; }
        .input-wrap { position: relative; }
        .input-wrap input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-wrap input::placeholder { color: rgba(255,255,255,0.2); }
        .input-wrap input:focus { border-color: #FFD200; }
        .add-btn {
          background: #FFD200;
          color: #0a0a0a;
          border: none;
          border-radius: 12px;
          padding: 12px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          margin-top: 4px;
        }
        .add-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,210,0,0.25); }
        .add-btn:disabled { opacity: 0.4; transform: none; cursor: not-allowed; }
        .error-msg { color: #ff6b6b; font-size: 13px; margin-top: 4px; }
        .section-header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 1rem; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem; }
        .count-badge {
          background: rgba(255,210,0,0.15);
          color: #FFD200;
          font-size: 12px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 100px;
        }
        .empty-state { text-align: center; padding: 4rem 2rem; color: rgba(255,255,255,0.2); }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty-text { font-size: 14px; }
        .bookmarks-list { display: flex; flex-direction: column; gap: 10px; }
        .bookmark-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s;
        }
        .bookmark-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-1px);
        }
        .favicon {
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden;
        }
        .favicon img { width: 18px; height: 18px; }
        .bookmark-info { flex: 1; overflow: hidden; }
        .bookmark-title {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          text-decoration: none;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.15s;
        }
        .bookmark-title:hover { color: #FFD200; }
        .bookmark-url {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-top: 2px;
        }
        .delete-btn {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.15);
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .delete-btn:hover { color: #ff6b6b; background: rgba(255,107,107,0.1); }
      `}</style>

      <div className="dashboard">
        <div className="bg-grid" />

        <header className="header">
          <div className="header-logo">
            <span className="dot">📌</span> Bookmarks
          </div>
          <div className="header-right">
            <div className="user-pill">{user?.email}</div>
            <button className="logout-btn" onClick={handleLogout}>Sign out</button>
          </div>
        </header>

        <main className="main">
          <h1 className="page-title">Your <span className="accent">links,</span><br />organized.</h1>
          <p className="page-sub">Add a bookmark below. It syncs in real time across all your tabs.</p>

          <div className="form-card">
            <div className="form-row">
              <div className="input-wrap">
                <input
                  type="text"
                  placeholder="Title  (e.g. OpenAI)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="input-wrap">
                <input
                  type="text"
                  placeholder="URL  (e.g. https://openai.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button className="add-btn" onClick={handleAdd} disabled={adding}>
                {adding ? 'Adding...' : '+ Add Bookmark'}
              </button>
            </div>
          </div>

          <div className="section-header">
            <span className="section-title">Saved</span>
            <span className="count-badge">{bookmarks.length}</span>
          </div>

          {bookmarks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔖</div>
              <p className="empty-text">No bookmarks yet. Add your first one above.</p>
            </div>
          ) : (
            <div className="bookmarks-list">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="bookmark-card">
                  <div className="favicon">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=32`}
                      alt=""
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                  <div className="bookmark-info">
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="bookmark-title">
                      {bookmark.title}
                    </a>
                    <div className="bookmark-url">{bookmark.url}</div>
                  </div>
                  <button className="delete-btn" onClick={() => handleDelete(bookmark.id)} title="Delete">✕</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}