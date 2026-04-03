export default function YoMeCepilloHome() {
  const cards = [
    {
      title: 'Aprende a\nCepillarte',
      text: 'Conoce la técnica correcta para cepillar tus dientes como un experto.',
      bg: 'from-[#9edfff] to-[#d9f3ff]',
      image: '/card-1.png',
    },
    {
      title: 'Haz tu\nEvaluación',
      text: 'Responde preguntas para saber qué tan bien te cepillas.',
      bg: 'from-[#ffb4c7] to-[#ffd9e5]',
      image: '/card-2.png',
    },
    {
      title: 'Descubre\nTu Nivel',
      text: 'Recibe un reporte de higiene dental y descubre tu progreso.',
      bg: 'from-[#9ce9c5] to-[#d7fff0]',
      image: '/card-3.png',
    },
    {
      title: 'Mejora Tu\nPuntuación',
      text: 'Sigue tus progresos, mejora tus hábitos y sube de nivel.',
      bg: 'from-[#ffe17f] to-[#fff1b6]',
      image: '/card-4.png',
    },
  ]

  return (
    <div className="min-h-screen overflow-hidden bg-[#f9fdff] text-slate-800">
      <header className="relative z-20 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <img src="/logo.png" alt="YoMeCepillo.cl" className="h-14 w-auto md:h-16" />
          </a>

          <nav className="hidden items-center gap-10 md:flex">
            {['Inicio', 'Guía de Cepillado', 'Dashboard', 'Contacto'].map((item, index) => (
              <a
                key={item}
                href="#"
                className={`text-lg font-extrabold transition ${
                  index === 0 ? 'text-[#1c88df]' : 'text-[#3f4777] hover:text-[#1c88df]'
                }`}
              >
                {item}
              </a>
            ))}
          </nav>

          <button className="rounded-full border-4 border-[#ffd089] bg-gradient-to-b from-[#ffbf5b] to-[#f39b2f] px-6 py-3 text-lg font-black text-white shadow-[0_8px_20px_rgba(243,155,47,0.4)] transition hover:scale-105">
            Empezar Guía
          </button>
        </div>

        <div className="h-8 bg-white [clip-path:ellipse(74%_100%_at_50%_0%)]" />
      </header>

      <main>
        <section className="relative -mt-2 overflow-hidden bg-cover bg-center bg-no-repeat px-4 pb-12 pt-8 lg:px-8 lg:pb-16" style={{ backgroundImage: "url('/hero.png')" }}>
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="pt-4 lg:pt-0">
              <h1 className="max-w-2xl text-[3rem] font-black leading-[0.95] sm:text-[4rem] lg:text-[5.1rem]">
                <span className="block text-[#3b9cf5] [text-shadow:0_3px_0_#ffffff,0_6px_14px_rgba(0,111,214,0.18)]">
                  Aprende a
                </span>
                <span className="block text-[#1f74e9] [text-shadow:0_3px_0_#ffffff,0_6px_14px_rgba(0,111,214,0.18)]">
                  Cepillarte
                </span>
                <span className="mt-3 block text-[2rem] text-[#3a5ab5] sm:text-[2.5rem] lg:text-[2.8rem]">
                  como un <span className="text-[#f59a2a]">Experto</span>
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-xl leading-relaxed text-[#35518f] sm:text-2xl">
                Únete a los más secos del cepillado. Aprende jugando a cuidar tus dientes y recibe un reporte de tu higiene.
              </p>

              <button className="mt-8 rounded-full border-4 border-[#ffd089] bg-gradient-to-b from-[#ffbf5b] to-[#f39b2f] px-8 py-4 text-2xl font-black text-white shadow-[0_10px_24px_rgba(243,155,47,0.35)] transition hover:scale-105">
                ¿Cuán Bien te Cepillas? ›
              </button>
            </div>

            <div className="relative flex min-h-[540px] items-center justify-center lg:justify-end">
              <div className="absolute right-0 top-2 z-10 max-w-[30rem] rounded-[2.6rem] bg-white/95 px-6 py-5 text-center shadow-[0_18px_30px_rgba(75,144,207,0.18)] lg:right-8">
                <p className="text-[1.9rem] font-black leading-tight text-[#3272c9]">
                  ¡Hola! Soy Ceps y voy a
                </p>
                <p className="mt-1 text-[2.3rem] font-black leading-tight text-[#f59a2a]">
                  enseñarte a cuidarte
                  <br />
                  tus dientes
                </p>
              </div>

              <div className="relative mt-28 w-full max-w-[620px]">
                <img
                  src="/ceps.png"
                  alt="Ceps con cepillo"
                  className="mx-auto h-auto w-full max-w-[540px] drop-shadow-[0_18px_30px_rgba(48,149,224,0.18)]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-white px-4 pb-14 pt-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-[2.7rem] font-black text-[#1f74e9] [text-shadow:0_3px_0_rgba(191,219,254,0.9)] sm:text-[3.3rem]">
              Lo que puedes hacer ✨
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <article
                  key={card.title}
                  className={`rounded-[2rem] border-4 border-white bg-gradient-to-b ${card.bg} p-5 shadow-[0_14px_30px_rgba(134,210,255,0.28)]`}
                >
                  <div className="flex min-h-[180px] items-center justify-center">
                    <img src={card.image} alt={card.title.replace('\n', ' ')} className="max-h-[170px] w-auto object-contain" />
                  </div>

                  <h3 className="mt-2 whitespace-pre-line text-[2rem] font-black leading-tight text-white [text-shadow:0_2px_0_rgba(80,80,80,0.25)]">
                    {card.title}
                  </h3>

                  <p className="mt-4 text-lg leading-relaxed text-[#52617f]">
                    {card.text}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <button className="rounded-full border-4 border-[#b7ec71] bg-gradient-to-b from-[#8ddd35] to-[#55b929] px-10 py-4 text-[2rem] font-black text-white shadow-[0_10px_24px_rgba(85,185,41,0.35)] transition hover:scale-105">
                ¡Vamos a Empezar! ›
              </button>
            </div>
          </div>
        </section>

        <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#d8f4ff_0%,#84d3ff_100%)] px-4 pb-6 pt-10 lg:px-8">
          <div className="absolute left-0 top-0 h-12 w-full bg-white [clip-path:ellipse(74%_100%_at_50%_0%)]" />

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <img src="/footer.png" alt="Personaje footer" className="h-20 w-auto" />
              <img src="/logo.png" alt="YoMeCepillo.cl" className="h-10 w-auto" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-base font-bold text-white">
              <a href="#">Inicio</a>
              <a href="#">Guía de Cepillado</a>
              <a href="#">Dashboard</a>
              <a href="#">Contacto</a>
            </div>

            <div className="text-sm font-semibold text-white/95">© 2026 YoMeCepillo.cl · Aprende a cuidar tu sonrisa.</div>
          </div>
        </footer>
      </main>
    </div>
  )
}
