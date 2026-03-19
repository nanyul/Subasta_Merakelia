import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Film,
  Filter,
  Wrench,
  LogIn,
  UserPlus,
  LogOut,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  ShoppingBasket,
  HandCoins,
  Palette,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";




export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const userEmail = "Invitado";

  const subasItems = [
    { title: "Subastas", href: "/subasta/activas", icon: <Film className="h-4 w-4" /> },
    {
      title: "Filtrar Subastas",
      href: "/subastas/filter",
      icon: <Filter className="h-4 w-4" />,
    },
  ];

  const cuadroItems = [
    { title: "Cuadros Subastables", href: "/CuadrosSubastables/galeria", icon: <Film className="h-4 w-4" /> },
    {
      title: "Filtrar Cuadros",
      href: "/CuadrosSubastables/filter",
      icon: <Filter className="h-4 w-4" />,
    },
  ];

  const mantItems = [
    {
      title: "Usuarios",
      href: "/user",
      icon: <Wrench className="h-4 w-4" />,
    },
    {
      title: "Cuadros Subastables",
      href: "/CuadrosSubastables",
      icon: <ShoppingBasket className="h-4 w-4" />,
    },
    {
      title: "Subastas",
      href: "/subastas",
      icon: <HandCoins className="h-4 w-4" />,
    }
  ];

  const userItems = [
    { title: "Login", href: "/user/login", icon: <LogIn className="h-4 w-4" /> },
    {
      title: "Registrarse",
      href: "/user/create",
      icon: <UserPlus className="h-4 w-4" />,
    },
    {
      title: "Logout",
      href: "#login",
      icon: <LogOut className="h-4 w-4" />,
    },
  ];
  return (
    <header className="w-full fixed top-0 left-0 z-50 backdrop-blur-xl bg-[#171741] border-b border-white/10 shadow-lg">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1280px] mx-auto" style={{ color: '#F2E199' }}>

        {/* -------- Logo -------- */}
        <div>
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <img src="/src/assets/logo.png" alt="Merakelia Logo" className="h-20 w-auto" style={{ maxWidth: '260px' }} />
          </Link>
        </div>

        {/* -------- Menú escritorio -------- */}
        <div className="hidden md:flex flex-1 justify-center">
          <Menubar className="w-auto bg-transparent border-none shadow-none space-x-6">
            
            {/* Subastas */}
            <MenubarMenu>
              <MenubarTrigger
                className="font-medium flex items-center gap-1 hover:text-secondary transition focus:bg-[#194174] data-[state=open]:bg-[#194174]"
                style={{ color: '#F2E199' }}
              >
                <HandCoins className="h-4 w-4" /> Subastas
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-primary/0 backdrop-blur-md border-white/10">
                {subasItems.map((item) => (
                  <MenubarItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-sm transition hover:bg-[#194174] focus:bg-[#194174] active:bg-[#194174] hover:text-[#F2E199] focus:text-[#F2E199] active:text-[#F2E199]"
                    >
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            {/* Cuadros */}
            <MenubarMenu>
              <MenubarTrigger
                className="font-medium flex items-center gap-1 hover:text-secondary transition focus:bg-[#194174] data-[state=open]:bg-[#194174]"
                style={{ color: '#F2E199' }}
              >
                <Palette className="h-4 w-4" /> Cuadros
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-primary/0 backdrop-blur-md border-white/10">
                {cuadroItems.map((item) => (
                  <MenubarItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-sm transition hover:bg-[#194174] focus:bg-[#194174] active:bg-[#194174] hover:text-[#F2E199] focus:text-[#F2E199] active:text-[#F2E199]"
                    >
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            {/* Mantenimientos */}
            <MenubarMenu>
              <MenubarTrigger
                className="font-medium flex items-center gap-1 hover:text-secondary transition focus:bg-[#194174] data-[state=open]:bg-[#194174]"
                style={{ color: '#F2E199' }}
              >
                <Layers className="h-4 w-4" /> Mantenimientos
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-primary/0 backdrop-blur-md border-white/10">
                {mantItems.map((item) => (
                  <MenubarItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-sm transition hover:bg-[#194174] focus:bg-[#194174] active:bg-[#194174] hover:text-[#F2E199] focus:text-[#F2E199] active:text-[#F2E199]"
                    >
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            {/* Usuario */}
            <MenubarMenu>
              <MenubarTrigger
                className="font-medium flex items-center gap-1 hover:text-secondary transition focus:bg-[#194174] data-[state=open]:bg-[#194174]"
                style={{ color: '#F2E199' }}
              >
                <User className="h-4 w-4" /> {userEmail}
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-primary/0 backdrop-blur-md border-white/10">
                {userItems.map((item) => (
                  <MenubarItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-sm transition hover:bg-[#194174] focus:bg-[#194174] active:bg-[#194174] hover:text-[#F2E199] focus:text-[#F2E199] active:text-[#F2E199]"
                    >
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        {/* -------- Carrito + Menú móvil -------- */}
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative hover:opacity-80">
            <ShoppingCart className="h-6 w-6" />
            <Badge
              className="absolute -top-2 -right-3 rounded-full px-2 py-0 text-xs font-semibold"
              variant="secondary"
            >
              3
            </Badge>
          </Link>

          {/* Menú móvil */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden inline-flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-accent/10 text-[#F2E199] transition backdrop-blur-lg w-72">
              <nav className="mt-8 px-4 space-y-6">
                <div>
                  <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                    <img src="/src/assets/logo.png" alt="Merakelia Logo" className="h-12 w-auto" style={{ maxWidth: '160px' }} />
                  </Link>
                </div>

                <div>
                  <h4 className="mb-2 text-lg font-semibold flex items-center gap-2">
                    <Film /> Películas
                  </h4>
                  {subasItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-[#F2E199] hover:bg-white/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  ))}
                </div>

                <div>
                  <h4 className="mb-2 text-lg font-semibold flex items-center gap-2">
                    <Layers /> Mantenimientos
                  </h4>
                  {mantItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-[#F2E199] hover:bg-white/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  ))}
                </div>

                <div>
                  <h4 className="mb-2 text-lg font-semibold flex items-center gap-2">
                    <User /> {userEmail}
                  </h4>
                  {userItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-[#F2E199] hover:bg-white/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
