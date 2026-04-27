import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import UserProvider from './context/UserProvider'
import { Layout } from './components/Layout/Layout'
import { RoleRoute } from './components/Auth/RoleRoute'
import { Home } from './components/Home/Home'
import { PageNotFound } from './components/Home/PageNotFound'

import Login from './components/User/Login'
import Register from './components/User/Register'
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
import { SubastaEnVivo } from './components/Subasta/SubastaEnVivo'
import { Pago } from './components/Pago/Pago'
import { PagoPendiente } from './components/Pago/PagoPendiente'
import { CreateUser } from './components/Tablas/Form/CreateUser'
import { UpdateUser } from './components/Tablas/Form/UpdateUser'
import { CreateCuadros } from './components/Tablas/Form/CreateCuadros'
import { UpdateCuadros } from './components/Tablas/Form/UpdateCuadros'
import { GraphSubasta } from './components/Subasta/GraphSubasta'

const rutas = createBrowserRouter([
  
  {
    element: <Layout/>,
    children: [
      // Ruta principal
      { index: true, element: <Home /> },

      // Ruta comodín (404)
      { path: "*", element: <PageNotFound /> },
       //Rutas componentes
      {
        path:"user",
        element: (
          <RoleRoute requiredRoles={["administrador"]}>
            <TableUser/>
          </RoleRoute>
        )
      },
      {path:"user/:id", element: <DetailUser />},
      {path:"user/create", element: <CreateUser/>},
      {path:"user/edit/:id", element: <UpdateUser/>},
      //Cuadros components
      {path:"CuadrosSubastables", element: <TableCuadros/>},
      {path:"CuadrosSubastables/galeria", element: <ListCuadros/>},
      {path:"CuadrosSubastables/create", element: <CreateCuadros/>},
      {path:"CuadrosSubastables/edit/:id", element: <UpdateCuadros/>},
      {path:"CuadrosSubastables/:id", element: <DetailCuadro/>},

      //Subastas components
      {path:"Subastas",element: <TableSubastas/>},
      {path:"subasta/:id", element: <DetailSubasta /> },
      {
        path: '/user/login',
        element: <Login />
      },
      {
        path: '/user/create',
        element: <Register />
      },
      {path:"subasta/activas", element: <ListSubastas />},
      {path:"subasta/pujas/:id", element: <HistorialPujas />},
      {path:"subasta/edit/:id", element: <UpdateSubasta />},
      {path:"subasta/create", element: <CreateSubasta />},
      {path:"subasta/en-vivo/:id", element: <SubastaEnVivo />},
      {
        path:"pago-pendiente",
        element: (
          <RoleRoute requiredRoles={["administrador"]}>
            <PagoPendiente />
          </RoleRoute>
        )

      },
      {
        path:"pago",
        element: (
          <RoleRoute requiredRoles={["administrador"]}>
            <Pago />
          </RoleRoute>
        )
      },
      {
        path: '/subasta/graph',
        element: <GraphSubasta />,
      },
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={rutas} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </UserProvider>
  </StrictMode>,
)