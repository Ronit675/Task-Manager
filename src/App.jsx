import './App.css'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import router from './app/router'

function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  )
}

export default App
