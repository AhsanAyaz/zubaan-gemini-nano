import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Home from './Home'


const router = createBrowserRouter([{
  path: '',
  element: <Home/>
}])

function App() {

  return (
    <RouterProvider router={router}/>
  )
}

export default App
