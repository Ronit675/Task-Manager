import { createBrowserRouter } from 'react-router-dom'

import { ProtectedRoute, PublicOnlyRoute } from '../components/RouteGuards'
import Dashboard from '../Pages/Dashboard'
import LandingPage from '../Pages/LandingPage'
import Loginpage from '../Pages/Login'
import NotFound from '../Pages/NotFound'
import SignupPage from '../Pages/SignUp'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <Loginpage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicOnlyRoute>
        <SignupPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
