import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import signupBg from '../signup-bg.jpg'

export default function AuthPage() {
    const [tab, setTab] = useState('login')
    const [form, setForm] = useState({ email: '', password: '', username: '' })
    const [showPass, setShowPass] = useState(false)
    const { addToast } = useStore()
    const { loading, handleLogin, handleRegister } = useAuth()
    const navigate = useNavigate()

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (tab === 'signup') {
                await handleRegister({ username: form.username, email: form.email, password: form.password })
                addToast('Account created! Welcome to MusePath 🎵', 'success')
                navigate('/onboarding')
            } else {
                await handleLogin({ email: form.email, password: form.password })
                addToast('Welcome back! 🎸', 'success')
                navigate('/dashboard')
            }
        } catch (err) {
            addToast(err.message || 'Something went wrong', 'error')
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.88)), url(${signupBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6)'
        }}>
            {/* Centered High Contrast Panel */}
            <div className="page-style-1">
                {/* Top stark border line */}
                <div className="page-style-2" />

                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8 page-style-3" >
                    <div className="page-style-4">
                        M
                    </div>
                    <span className="page-style-5">
                        MusePath
                    </span>
                </div>

                {/* Form Title */}
                <h1 className="page-style-6">
                    {tab === 'login' ? 'Enter Stage' : 'Join Fanclub'}
                </h1>
                <p className="page-style-7">
                    {tab === 'login' ? 'Sign in to access your roadmaps' : 'Register to generate your custom AI plan'}
                </p>

                {/* Tabs */}
                <div className="page-style-8">
                    {['login', 'signup'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className="page-style-9"
                        >
                            {t === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="page-style-10">
                    {tab === 'signup' && (
                        <div className="input-group">
                            <label className="input-label page-style-11" >Musician Username</label>
                            <div className="page-style-12">
                                <User size={14} className="page-style-13" />
                                <input
                                    className="input page-style-14"

                                    name="username"
                                    placeholder="e.g. SLAYER_99"
                                    value={form.username}
                                    onChange={handle}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label page-style-15" >Email Address</label>
                        <div className="page-style-16">
                            <Mail size={14} className="page-style-17" />
                            <input
                                className="input page-style-18"

                                name="email"
                                type="email"
                                placeholder="you@metal.com"
                                value={form.email}
                                onChange={handle}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label page-style-19" >Password</label>
                        <div className="page-style-20">
                            <Lock size={14} className="page-style-21" />
                            <input
                                className="input page-style-22"

                                name="password"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handle}
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(p => !p)}
                                className="page-style-23"
                            >
                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Stark Action Button */}
                    <button
                        type="submit"
                        className="btn btn-primary page-style-24"

                        disabled={loading}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#000000'
                            e.currentTarget.style.color = '#ffffff'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff'
                            e.currentTarget.style.color = '#000000'
                        }}
                    >
                        {loading ? (
                            <span className="page-style-25">
                                <div className="loading-spinner page-style-26" />
                                Loading...
                            </span>
                        ) : (
                            <>
                                {tab === 'login' ? 'Sign In' : 'Register'}
                                <ArrowRight size={16} className="page-style-27" />
                            </>
                        )}
                    </button>
                </form>

                <p className="page-style-28">
                    {tab === 'login' ? "New recruit? " : 'Already registered? '}
                    <button
                        onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
                        className="page-style-29"
                    >
                        {tab === 'login' ? 'Create Account' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    )
}
