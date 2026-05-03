import './App.css'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Routes from './Rotues/Routes'

function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <RouterProvider router={Routes}></RouterProvider>
      </div>
    </AuthProvider>
  )
}

export default App
