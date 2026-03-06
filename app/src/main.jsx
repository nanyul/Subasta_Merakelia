import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Home } from './components/Home/Home'
import { PageNotFound } from './components/Home/PageNotFound'
//Rutas
import TableUser from './components/Tablas/TableUsers'
import { DetailUser } from './components/Tablas/DetailUser'
import TableCuadros from './components/Tablas/TableCuadros'
import { DetailCuadro } from './components/Tablas/DetailCuadros'
import { ListCuadros } from './components/Tablas/ListCuadros'
const rutas = createBrowserRouter([
  {
    element: <Layout/>,
    children: [
      // Ruta principal
      { index: true, element: <Home /> },

      // Ruta comodín (404)
      { path: "*", element: <PageNotFound /> },
       //Rutas componentes
      {path:"user", element: <TableUser/>},
      {path:"user/:id", element: <DetailUser />},
      //Cuadros components
      {path:"CuadrosSubastables", element: <TableCuadros/>},
      {path:"CuadrosSubastables/:id", element: <DetailCuadro/>},
      {path:"CuadrosSubastables/galeria", element: <ListCuadros/>},
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>,
)
