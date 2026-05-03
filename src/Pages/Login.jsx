import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Linewaves from '../components/LineWaves'
import { useAuth } from '../context/useAuth'

const Loginpage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError('')
      await login(form)
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="landing-page-container">
      <Linewaves
        speed={0.3}
        innerLineCount={32}
        outerLineCount={36}
        warpIntensity={1.0}
        rotation={-45}
        edgeFadeWidth={0.0}
        colorCycleSpeed={1.0}
        brightness={0.5}
        color1="#c28d38"
        color2="#608b47"
        color3="#24263f"
        enableMouseInteraction={true}
        mouseInfluence={2.0}
      />
      <div className="centered-shell">
        <div className="auth-panel">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to your workspace</h1>
          <p className="subtle-copy">Use your account to manage projects and assigned work.</p>
          {error ? <div className="alert error-alert">{error}</div> : null}
          <form className="stack-form" onSubmit={handleSubmit}>
            <input
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
              type="email"
              value={form.email}
            />
            <input
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Password"
              type="password"
              value={form.password}
            />
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <p className="auth-footer">
            Need an account?{' '}
            <Link to="/signup">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Loginpage
