export function Footer() {
  return (
    <footer
      className="fixed bottom-0 left-0 z-40 w-full overflow-hidden border-t px-4 py-3 shadow-2xl"
      style={{
        background: "linear-gradient(90deg, #171741 0%, #194174 50%, #171741 100%)",
        borderColor: "rgba(242, 225, 153, 0.35)",
      }}
    >
      <div
        className="pointer-events-none absolute -left-8 top-0 h-16 w-16 rounded-full blur-2xl"
        style={{ backgroundColor: "rgba(111, 184, 230, 0.45)" }}
      />
      <div
        className="pointer-events-none absolute -right-8 top-0 h-16 w-16 rounded-full blur-2xl"
        style={{ backgroundColor: "rgba(236, 180, 77, 0.45)" }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-2xl leading-none" style={{ color: "#ECB44D", fontFamily: "Great Vibes, cursive", fontWeight: 400 }}>
            Merakelia
          </p>
          <p className="text-xs" style={{ color: "#F2E199" }}>
            ISW-613
          </p>
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
          <span className="h-px w-10" style={{ backgroundColor: "rgba(111, 184, 230, 0.8)" }} />
          <span className="text-xs" style={{ color: "#F2E199" }}>
            Arte y Subastas
          </span>
          <span className="h-px w-10" style={{ backgroundColor: "rgba(236, 180, 77, 0.85)" }} />
        </div>

        <p className="text-xs" style={{ color: "#F2E199" }}>
          {new Date().getFullYear()} Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
