import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Linewaves from '../components/LineWaves'
import { useAuth } from '../context/useAuth'

const SignupPage = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError('')
      await signup(form)
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
          <p className="eyebrow">Create account</p>
          <h1>Start a new team workspace</h1>
          <p className="subtle-copy">
            Signup creates your account and logs you straight into the dashboard.
          </p>
          {error ? <div className="alert error-alert">{error}</div> : null}
          <form className="stack-form" onSubmit={handleSubmit}>
            <input
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Full name"
              value={form.name}
            />
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
            <div className="surface" style={{ padding: '12px' }}>
              <p style={{ margin: 0, marginBottom: 8 }}>Role</p>
              <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginRight: 12 }}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={form.role === 'admin'}
                  onChange={() => setForm((current) => ({ ...current, role: 'admin' }))}
                />
                Admin
              </label>
              <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="radio"
                  name="role"
                  value="member"
                  checked={form.role === 'member'}
                  onChange={() => setForm((current) => ({ ...current, role: 'member' }))}
                />
                Member
              </label>
            </div>
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="auth-footer">
            Already registered?{' '}
            <Link to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
