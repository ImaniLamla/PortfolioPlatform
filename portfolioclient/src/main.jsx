import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//add react router
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { store } from './store/store.jsx';
import { Provider } from 'react-redux';
import './index.css'
import App from './App.jsx'
import Signup from './pages/signup.jsx';
import Signin from './pages/signin.jsx';
import RootLayout from './layouts/RootLayout.jsx';
import Error from './pages/error.jsx';
import Dashboard from './pages/dashboard.jsx';
import Profile from './pages/profile.jsx';
import Projects from './pages/projects.jsx';
import Experience from './pages/experience.jsx';
import Awards from './pages/awards.jsx';


const router = createBrowserRouter(
  createRoutesFromElements((
    <Route path='/' element={<RootLayout /> }>
      <Route index element={<App />}/>
      <Route path='/signup' element={<Signup />} />
      <Route path='/signin' element={<Signin />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/projects' element={<Projects />} />
      <Route path='/experience' element={<Experience />} />
      <Route path='/awards' element={<Awards />} />
      <Route path='*' element={<Error />} />
    </Route>

  ))
)


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
)

