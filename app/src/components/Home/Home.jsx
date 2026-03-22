import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Palette, Sparkles } from "lucide-react";
import CuadrosService from "../../services/CuadrosService";
import heroImageTicket from "../../assets/ImageHero.png";

const BASE_URL = import.meta.env.VITE_BASE_URL + "uploads";
const serifFont = "Cormorant Garamond, serif";
const titleStyle = {
  color: "#ECB44D",
  fontFamily: "Great Vibes, cursive",
  fontWeight: 400,
  textShadow: "0 3px 18px rgba(0, 0, 0, 0.45)",
};
const bodyTextStyle = {
  color: "#F2E199",
  fontFamily: serifFont,
  fontWeight: 400,
  textShadow: "0 2px 14px rgba(0, 0, 0, 0.35)",
};
const loginButtonStyle = {
  color: "#F2E199",
  borderColor: "rgba(242, 225, 153, 0.8)",
  background: "linear-gradient(180deg, rgba(23, 23, 65, 0.18) 0%, rgba(23, 23, 65, 0.42) 100%)",
  boxShadow: "0 10px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(8px)",
  fontFamily: serifFont,
  fontWeight: 600,
  letterSpacing: "0.04em",
  textShadow: "0 2px 10px rgba(0, 0, 0, 0.35)",
};
const galleryButtonStyle = {
  color: "#171741",
  backgroundColor: "#F2E199",
  borderColor: "rgba(242, 225, 153, 0.9)",
  boxShadow: "0 14px 26px rgba(0, 0, 0, 0.18)",
  fontFamily: serifFont,
  fontWeight: 700,
  letterSpacing: "0.04em",
};
const tagStyle = {
  color: "#F2E199",
  borderColor: "rgba(111, 184, 230, 0.45)",
  backgroundColor: "rgba(23, 23, 65, 0.34)",
};
const cardButtonStyle = {
  color: "#171741",
  backgroundColor: "#ECB44D",
  fontWeight: 700,
};

const fallbackFeatured = [
  {
    id: "placeholder-1",
    nombre: "Trazos Celestes",
    nombre_artista: "Coleccion Merakelia",
    estado_cuadro: "Disponible",
    categorias: ["Paisaje", "Expresionismo"],
    gradient: "linear-gradient(135deg, rgba(23,23,65,0.95) 0%, rgba(25,65,116,0.92) 48%, rgba(111,184,230,0.9) 100%)",
  },
  {
    id: "placeholder-2",
    nombre: "Resplandor Dorado",
    nombre_artista: "Coleccion Merakelia",
    estado_cuadro: "Destacado",
    categorias: ["Abstracto", "Luz"],
    gradient: "linear-gradient(135deg, rgba(25,65,116,0.92) 0%, rgba(236,180,77,0.88) 52%, rgba(242,225,153,0.86) 100%)",
  },
  {
    id: "placeholder-3",
    nombre: "Noche de Atelier",
    nombre_artista: "Coleccion Merakelia",
    estado_cuadro: "Curado",
    categorias: ["Moderno", "Nocturno"],
    gradient: "linear-gradient(135deg, rgba(23,23,65,0.98) 0%, rgba(23,23,65,0.9) 36%, rgba(111,184,230,0.72) 100%)",
  },
];

export function Home() {
  const [cuadrosDestacados, setCuadrosDestacados] = useState(fallbackFeatured);

  const obtenerCategorias = (cuadro) => {
    if (Array.isArray(cuadro.categorias)) {
      return cuadro.categorias.slice(0, 2).map(c => typeof c === 'object' ? c.descripcion : c);
    } else if (cuadro.categorias) {
      return [typeof cuadro.categorias === 'object' ? cuadro.categorias.descripcion : cuadro.categorias];
    }
    return ["Colección destacada"];
  };

  useEffect(() => {
    const obtenerCuadrosDestacados = async () => {
      try {
        const respuesta = await CuadrosService.getCuadros();
        const resultado = respuesta.data;
        if (resultado?.success && Array.isArray(resultado.data) && resultado.data.length > 0) {
          setCuadrosDestacados(resultado.data.slice(0, 3));
        }
      } catch {
        // Mantener los cuadros de fallback si la API no responde.
      }
    };

    obtenerCuadrosDestacados();
  }, []);

  return (
    <div style={{ backgroundColor: "#171741" }}>
      <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden text-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImageTicket})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.5)",
          }}
        />
        <div className="hero-stars-soft absolute inset-0 z-10" />
        <div className="hero-stars absolute inset-0 z-10" />
        <div
          className="absolute inset-0 z-10"
          style={{ background: "radial-gradient(circle at center, rgba(18, 24, 58, 0.08) 0%, rgba(5, 8, 24, 0.34) 70%, rgba(3, 5, 16, 0.52) 100%)" }}
        />

        <div className="relative z-20 max-w-4xl px-6 pt-2">
          <h1 className="mb-5 text-5xl leading-[0.95] drop-shadow-lg md:text-5xl lg:text-[5.1rem]" style={titleStyle}>
            <span className="block">La vida es un lienzo, tú</span>
            <span className="block">decides cómo pintarla</span>
          </h1>
          <p className="mx-auto max-w-xl text-xl leading-snug drop-shadow md:text-2xl" style={bodyTextStyle}>
            Participa en nuestras subastas y encuentra la pieza que dará color a tu historia.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="/user/login"
              className="inline-flex items-center rounded-full border px-8 py-3 text-lg transition duration-300 hover:-translate-y-0.5"
              style={loginButtonStyle}
            >
              Iniciar sesión
            </a>
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden px-6 py-20 md:px-10"
        style={{
          background: "linear-gradient(180deg, #171741 0%, #194174 48%, #171741 100%)",
        }}
      >
        <div
          className="absolute -left-10 top-12 h-40 w-40 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(111, 184, 230, 0.16)" }}
        />
        <div
          className="absolute right-0 top-0 h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(236, 180, 77, 0.16)" }}
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-4">
                <span className="h-px w-16" style={{ backgroundColor: "#6FB8E6" }} />
                <span
                  className="text-sm uppercase tracking-[0.35em]"
                  style={{ color: "#ECB44D", fontFamily: "Cormorant Garamond, serif" }}
                >
                  Curaduría Merakelia
                </span>
              </div>
              <h2
                className="text-4xl md:text-5xl"
                style={{ color: "#F2E199", fontFamily: serifFont, fontWeight: 600 }}
              >
                Obras Destacadas
              </h2>
              <p
                className="mt-3 max-w-xl text-lg leading-relaxed"
                style={{ color: "rgba(242, 225, 153, 0.84)", fontFamily: serifFont }}
              >
                Una selección especial de cuadros subastables para descubrir piezas con carácter, color y presencia.
              </p>
            </div>

            <Link
              to="/CuadrosSubastables/galeria"
              className="inline-flex items-center gap-2 self-start rounded-full border px-6 py-3 transition duration-300 hover:-translate-y-0.5"
              style={galleryButtonStyle}
            >
              Ir a galería
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {cuadrosDestacados.map((cuadro, index) => {
              const imagenSrc = cuadro.imagen?.datos ? `${BASE_URL}/${cuadro.imagen.datos}` : null;
              const categorias = obtenerCategorias(cuadro);

              return (
                <article
                  key={cuadro.id}
                  className="group overflow-hidden rounded-[28px] border p-4 transition duration-300 hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(180deg, rgba(23, 23, 65, 0.86) 0%, rgba(25, 65, 116, 0.72) 100%)",
                    borderColor: index === 1 ? "rgba(236, 180, 77, 0.42)" : "rgba(111, 184, 230, 0.32)",
                    boxShadow: "0 22px 40px rgba(0, 0, 0, 0.18)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="relative overflow-hidden rounded-[22px]">
                    {imagenSrc ? (
                      <img
                        src={imagenSrc}
                        alt={cuadro.nombre}
                        className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-72 w-full items-end p-6" style={{ background: cuadro.gradient || fallbackFeatured[index % fallbackFeatured.length].gradient }}>
                        <Sparkles className="h-10 w-10" style={{ color: "#F2E199" }} />
                      </div>
                    )}
                    <div
                      className="absolute inset-x-0 bottom-0 h-28"
                      style={{ background: "linear-gradient(180deg, rgba(23,23,65,0) 0%, rgba(23,23,65,0.85) 100%)" }}
                    />
                    <span
                      className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em]"
                      style={{
                        backgroundColor: "rgba(242, 225, 153, 0.92)",
                        color: "#171741",
                        fontWeight: 700,
                      }}
                    >
                      {cuadro.estado_cuadro || "Destacado"}
                    </span>
                  </div>

                  <div className="px-2 pb-2 pt-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {categorias.map((categoria) => (
                        <span key={`${cuadro.id}-${categoria}`} className="rounded-full border px-3 py-1 text-xs" style={tagStyle}>
                          {categoria}
                        </span>
                      ))}
                    </div>

                    <h3
                      className="text-2xl"
                      style={{
                        color: "#F2E199",
                        fontFamily: "Cormorant Garamond, serif",
                        fontWeight: 600,
                      }}
                    >
                      {cuadro.nombre}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: "#6FB8E6" }}>
                      {cuadro.nombre_artista || "Autor destacado"}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(242, 225, 153, 0.82)" }}>
                        <Palette className="h-4 w-4" style={{ color: "#ECB44D" }} />
                        Cuadro subastable
                      </div>

                      {typeof cuadro.id === "number" ? (
                        <Link
                          to={`/CuadrosSubastables/${cuadro.id}`}
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition duration-300 hover:-translate-y-0.5"
                          style={cardButtonStyle}
                        >
                          Ver detalle
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <Link
                          to="/CuadrosSubastables/galeria"
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition duration-300 hover:-translate-y-0.5"
                          style={cardButtonStyle}
                        >
                          Explorar
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden px-6 py-20 md:px-10"
        style={{ background: "linear-gradient(180deg, #194174 0%, #171741 100%)" }}
      >
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2
              className="text-4xl md:text-5xl"
              style={{ color: "#F2E199", fontFamily: serifFont, fontWeight: 700 }}
            >
              ¿Cómo funciona la subasta?
            </h2>
            <p
              className="mx-auto mt-4 max-w-3xl text-lg"
              style={{ color: "rgba(242, 225, 153, 0.9)", fontFamily: serifFont }}
            >
              Participar es sencillo: explora, oferta y gana. En pocos pasos puedes llevarte una obra unica.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <article
              className="rounded-3xl p-6"
              style={{ backgroundColor: "#F2E199", color: "#171741", boxShadow: "0 16px 30px rgba(0,0,0,0.2)" }}
            >
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: "#171741", color: "#F2E199" }}
              >
                1
              </span>
              <h3 className="mt-4 text-2xl" style={{ fontFamily: serifFont, fontWeight: 700 }}>
                Encuentra una obra
              </h3>
              <p className="mt-3 text-base" style={{ fontFamily: serifFont }}>
                Navega por las piezas disponibles y revisa sus detalles para elegir la que deseas subastar.
              </p>
            </article>

            <article
              className="rounded-3xl p-6"
              style={{ backgroundColor: "#ECB44D", color: "#171741", boxShadow: "0 16px 30px rgba(0,0,0,0.2)" }}
            >
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: "#171741", color: "#F2E199" }}
              >
                2
              </span>
              <h3 className="mt-4 text-2xl" style={{ fontFamily: serifFont, fontWeight: 700 }}>
                Realiza tu oferta
              </h3>
              <p className="mt-3 text-base" style={{ fontFamily: serifFont }}>
                Ingresa con tu cuenta y propone tu monto. Puedes mejorar tu oferta antes del cierre.
              </p>
            </article>

            <article
              className="rounded-3xl p-6"
              style={{ backgroundColor: "#F2E199", color: "#171741", boxShadow: "0 16px 30px rgba(0,0,0,0.2)" }}
            >
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: "#171741", color: "#F2E199" }}
              >
                3
              </span>
              <h3 className="mt-4 text-2xl" style={{ fontFamily: serifFont, fontWeight: 700 }}>
                Confirma y gana
              </h3>
              <p className="mt-3 text-base" style={{ fontFamily: serifFont }}>
                Si tu oferta es la ganadora, te contactamos para formalizar el proceso y entrega de la obra.
              </p>
            </article>
          </div>
        </div>
      </section>

    </div>
  );
}

