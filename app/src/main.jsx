import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout/Layout'
import { Home } from './components/Home/Home'
import { PageNotFound } from './components/Home/PageNotFound'
//Rutas
import TableUser from './components/Tablas/TableUsers'
import { DetailUser } from './components/Tablas/DetailUser'
import TableCuadros from './components/Tablas/TableCuadros'
import { DetailCuadro } from './components/Tablas/DetailCuadros'
import { ListCuadros } from './components/Tablas/ListCuadros'
import  TableSubastas  from './components/Tablas/TableSubastas'
import { DetailSubasta } from './components/Tablas/DetailSubasta'
import { HistorialPujas } from './components/Tablas/HistorialPujas'
import { UpdateSubasta } from './components/Tablas/Form/UpdateSubasta'
import { CreateSubasta } from './components/Tablas/Form/CreateSubasta'
import { ListSubastas } from './components/Tablas/ListSubastas'
import { CreateUser } from './components/Tablas/Form/CreateUser'
import { UpdateUser } from './components/Tablas/Form/UpdateUser'
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
      {path:"user/create", element: <CreateUser/>},
      {path:"user/edit/:id", element: <UpdateUser/>},
      //Cuadros components
      {path:"CuadrosSubastables", element: <TableCuadros/>},
      {path:"CuadrosSubastables/:id", element: <DetailCuadro/>},
      {path:"CuadrosSubastables/galeria", element: <ListCuadros/>},
      //Subastas components
      {path:"Subastas",element: <TableSubastas/>},
      {path:"subasta/:id", element: <DetailSubasta /> },
      {path:"subasta/activas", element: <ListSubastas />},
      {path:"subasta/pujas/:id", element: <HistorialPujas />},
      {path:"subasta/edit/:id", element: <UpdateSubasta />},
      {path:"subasta/create", element: <CreateSubasta />}
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
      }}
    />
  </StrictMode>,
)