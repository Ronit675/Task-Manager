import { Link } from 'react-router-dom'
import Linewaves from '../components/LineWaves'
import { useAuth } from '../context/useAuth'

const LandingPage = () => {
  const { isAuthenticated } = useAuth()

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
      <div className="landing-shell">
        <div className="hero-copy">
          <p className="eyebrow">Team Task Manager</p>
          <h1>Projects, roles, and overdue work without spreadsheet drift.</h1>
          <p className="hero-text">
            Create projects, invite admins and members, assign tasks, and keep a tight view on
            status changes across the team.
          </p>
          <div className="hero-actions">
            <Link className="primary-button button-link" to={isAuthenticated ? '/dashboard' : '/signup'}>
              {isAuthenticated ? 'Open dashboard' : 'Create account'}
            </Link>
            {!isAuthenticated ? (
              <Link className="ghost-button button-link" to="/login">
                Login
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
