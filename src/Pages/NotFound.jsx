import { Link } from 'react-router-dom'

const NotFound = () => (
  <div className="centered-shell">
    <div className="auth-panel">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="subtle-copy">The route you requested does not exist in this workspace.</p>
      <Link className="primary-button button-link" to="/">
        Back to home
      </Link>
    </div>
  </div>
)

export default NotFound
