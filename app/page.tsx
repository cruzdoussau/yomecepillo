"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useMemo, useState } from "react";

type ToolId = "guia" | "evaluacion" | "nivel" | "dashboard";
type AnswerMap = Record<number, number>;

const features: Array<{
  id: ToolId;
  title: string;
  body: string;
  accent: string;
  visual: string;
  action: string;
}> = [
  {
    id: "guia",
    title: "Aprende a Cepillarte",
    body: "Conoce la tecnica correcta para cepillar tus dientes como un experto.",
    accent: "blue",
    visual: "brush",
    action: "Ver tecnica",
  },
  {
    id: "evaluacion",
    title: "Haz tu Evaluacion",
    body: "Responde preguntas entretenidas para saber que tan bien te cepillas.",
    accent: "pink",
    visual: "check",
    action: "Responder",
  },
  {
    id: "nivel",
    title: "Descubre Tu Nivel",
    body: "Recibe un reporte de higiene dental y conoce si eres inicial, medio o avanzado.",
    accent: "mint",
    visual: "chart",
    action: "Ver nivel",
  },
  {
    id: "dashboard",
    title: "Mejora Tu Puntuacion",
    body: "Sigue tus progresos, mejora tus habitos y sube de nivel.",
    accent: "yellow",
    visual: "score",
    action: "Mi racha",
  },
];

const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Guia de Cepillado", href: "#plataforma", tool: "guia" as ToolId },
  { label: "Dashboard", href: "#plataforma", tool: "dashboard" as ToolId },
  { label: "Contacto", href: "#contacto" },
];

const brushingSteps = [
  {
    title: "Prepara tu cepillo",
    time: "10 seg",
    body: "Usa una cantidad pequena de pasta con fluor, del porte de una arveja.",
  },
  {
    title: "Cepilla por fuera",
    time: "40 seg",
    body: "Inclina el cepillo y haz movimientos suaves desde la encia hacia el diente.",
  },
  {
    title: "Cepilla por dentro",
    time: "40 seg",
    body: "Repite por la cara interna de los dientes, sin apurarte ni presionar fuerte.",
  },
  {
    title: "Muelas y lengua",
    time: "30 seg",
    body: "Limpia las superficies donde masticas y termina cepillando suavemente la lengua.",
  },
  {
    title: "Enjuague y sonrisa",
    time: "20 seg",
    body: "Escupe la espuma, limpia el cepillo y deja tu kit listo para la proxima mision.",
  },
];

const quizQuestions = [
  {
    question: "Cuantas veces al dia deberias cepillarte?",
    options: ["Solo cuando me acuerdo", "2 veces o mas", "Una vez a la semana"],
    correct: 1,
  },
  {
    question: "Cuanto tiempo debe durar un buen cepillado?",
    options: ["20 segundos", "2 minutos", "10 minutos"],
    correct: 1,
  },
  {
    question: "Que movimiento cuida mejor las encias?",
    options: ["Fuerte de lado a lado", "Suave desde la encia al diente", "Solo morder el cepillo"],
    correct: 1,
  },
  {
    question: "Que zona se suele olvidar?",
    options: ["La lengua", "El pelo", "Las orejas"],
    correct: 0,
  },
  {
    question: "Cuando conviene cambiar el cepillo?",
    options: ["Cuando las cerdas estan abiertas", "Nunca", "Cada 5 anos"],
    correct: 0,
  },
];

const dailyTasks = [
  "Cepillado de la manana",
  "Cepillado de la noche",
  "Cepille la lengua",
  "Use hilo dental o pedi ayuda",
  "Tome agua y evite dulces pegajosos",
];

const emptyAnswers: AnswerMap = {};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getLevel(score: number) {
  if (score >= 80) {
    return {
      name: "Experto Ceps",
      badge: "Nivel avanzado",
      className: "advanced",
      message: "Tu tecnica esta muy bien encaminada. Mantente constante y cuida tu racha.",
      daily: [
        "Cepillate manana y noche por 2 minutos.",
        "Usa hilo dental con ayuda si lo necesitas.",
        "Revisa que no queden zonas sin limpiar.",
      ],
    };
  }

  if (score >= 50) {
    return {
      name: "Explorador Dental",
      badge: "Nivel medio",
      className: "medium",
      message: "Vas bien. El siguiente paso es ordenar tu rutina y no saltarte la noche.",
      daily: [
        "Practica la tecnica por secciones.",
        "Usa un temporizador de 2 minutos.",
        "Marca tu progreso todos los dias.",
      ],
    };
  }

  return {
    name: "Aprendiz Sonrisa",
    badge: "Nivel inicial",
    className: "starter",
    message: "Estas partiendo. Lo importante es aprender el orden y repetirlo cada dia.",
    daily: [
      "Mira la guia antes de cepillarte.",
      "Pide ayuda para llegar a las muelas.",
      "Completa una mision diaria sin apuro.",
    ],
  };
}

function calculateScore(nextAnswers: AnswerMap) {
  const correct = quizQuestions.reduce((total, item, index) => {
    return total + (nextAnswers[index] === item.correct ? 1 : 0);
  }, 0);

  return Math.round((correct / quizQuestions.length) * 100);
}

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolId>("guia");
  const [guideStep, setGuideStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>(emptyAnswers);
  const [savedScore, setSavedScore] = useState(0);
  const [checkedTasks, setCheckedTasks] = useState<boolean[]>(() => dailyTasks.map(() => false));
  const [streak, setStreak] = useState(0);
  const [lastCompleted, setLastCompleted] = useState("");

  const quizDone = Object.keys(answers).length === quizQuestions.length;
  const currentScore = useMemo(() => calculateScore(answers), [answers]);

  const score = quizDone ? currentScore : savedScore;
  const level = getLevel(score);
  const completedCount = checkedTasks.filter(Boolean).length;
  const progress = Math.round((completedCount / dailyTasks.length) * 100);
  const allDoneToday = completedCount === dailyTasks.length;

  useEffect(() => {
    window.setTimeout(() => {
      const storedScore = Number(localStorage.getItem("ymc-score") || "0");
      const storedStreak = Number(localStorage.getItem("ymc-streak") || "0");
      const storedLastCompleted = localStorage.getItem("ymc-last-completed") || "";
      const storedDay = localStorage.getItem(`ymc-day-${todayKey()}`);

      setSavedScore(storedScore);
      setStreak(storedStreak);
      setLastCompleted(storedLastCompleted);

      if (storedDay) {
        setCheckedTasks(JSON.parse(storedDay) as boolean[]);
      }
    }, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem(`ymc-day-${todayKey()}`, JSON.stringify(checkedTasks));
  }, [checkedTasks]);

  function openTool(tool: ToolId) {
    setActiveTool(tool);
    requestAnimationFrame(() => {
      document.getElementById("plataforma")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function toggleTask(index: number) {
    setCheckedTasks((current) =>
      current.map((checked, itemIndex) => (itemIndex === index ? !checked : checked)),
    );
  }

  function answerQuestion(questionIndex: number, optionIndex: number) {
    setAnswers((current) => {
      const nextAnswers = { ...current, [questionIndex]: optionIndex };

      if (Object.keys(nextAnswers).length === quizQuestions.length) {
        const nextScore = calculateScore(nextAnswers);
        setSavedScore(nextScore);
        localStorage.setItem("ymc-score", String(nextScore));
      }

      return nextAnswers;
    });
  }

  function completeDay() {
    const today = todayKey();

    if (!allDoneToday || lastCompleted === today) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    const nextStreak = lastCompleted === yesterdayKey ? streak + 1 : 1;

    setStreak(nextStreak);
    setLastCompleted(today);
    localStorage.setItem("ymc-streak", String(nextStreak));
    localStorage.setItem("ymc-last-completed", today);
  }

  function resetToday() {
    setCheckedTasks(dailyTasks.map(() => false));
  }

  return (
    <main className="site-shell" id="inicio">
      <header className="topbar" aria-label="Navegacion principal">
        <a className="brand" href="#inicio">
          <Image
            src="/logo.png"
            alt="YoMeCepillo.cl"
            width={360}
            height={152}
            priority
          />
        </a>

        <nav className="nav-links">
          {navItems.map((item) => (
            <a
              key={item.label}
              className={
                item.tool === activeTool || (item.label === "Inicio" && activeTool === "guia")
                  ? "active"
                  : ""
              }
              href={item.href}
              onClick={() => item.tool && setActiveTool(item.tool)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button className="pill-button top-cta" onClick={() => openTool("guia")} type="button">
          Empezar Guia
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      </header>

      <section className="hero">
        <div className="sparkles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="hero-copy">
          <p className="kicker">Aprende jugando a cuidar tu sonrisa</p>
          <h1>
            Aprende a <span>Cepillarte</span>
            <small>
              como un <b>Experto</b>
            </small>
          </h1>
          <p className="hero-description">
            Unete a los mas secos del cepillado. Aprende jugando a cuidar tus
            dientes y recibe un reporte de tu higiene.
          </p>
          <button className="pill-button hero-cta" onClick={() => openTool("evaluacion")} type="button">
            &iquest;Cuan Bien te Cepillas?
            <span aria-hidden="true">&rsaquo;</span>
          </button>
        </div>

        <div className="hero-art" aria-label="Diente feliz con cepillo dental">
          <div className="speech-bubble">
            <strong>&iexcl;Hola! Soy Ceps</strong> y voy a
            <span> ensenarte a cuidar tus dientes</span>
          </div>
          <Image
            src="/assets/tooth-hero.png"
            alt="Mascota diente feliz sosteniendo un cepillo de dientes azul"
            width={720}
            height={720}
            priority
          />
        </div>
      </section>

      <section className="features" id="evaluacion" aria-labelledby="features-title">
        <h2 id="features-title">Lo que puedes hacer</h2>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className={`feature-card ${feature.accent}`} key={feature.title}>
              <h3>{feature.title}</h3>
              <div className={`feature-visual ${feature.visual}`} aria-hidden="true">
                <span />
              </div>
              <p>{feature.body}</p>
              <button className="feature-action" onClick={() => openTool(feature.id)} type="button">
                {feature.action}
              </button>
            </article>
          ))}
        </div>

        <button className="start-button" onClick={() => openTool("guia")} type="button">
          &iexcl;Vamos a Empezar!
        </button>
      </section>

      <section className="platform-panel" id="plataforma" aria-label="Plataforma de acompanamiento dental">
        <div className="panel-heading">
          <p>Tu companero diario</p>
          <h2>Plan de cepillado y progreso</h2>
        </div>

        <div className="tool-tabs" role="tablist" aria-label="Herramientas">
          {features.map((feature) => (
            <button
              aria-selected={activeTool === feature.id}
              className={activeTool === feature.id ? "selected" : ""}
              key={feature.id}
              onClick={() => setActiveTool(feature.id)}
              role="tab"
              type="button"
            >
              {feature.title}
            </button>
          ))}
        </div>

        <div className="tool-surface">
          {activeTool === "guia" && (
            <section className="guide-tool" id="guia">
              <div className="tool-copy">
                <span className="tool-badge">Tecnica 2 minutos</span>
                <h3>{brushingSteps[guideStep].title}</h3>
                <p>{brushingSteps[guideStep].body}</p>
                <div className="timer-pill">{brushingSteps[guideStep].time}</div>
                <div className="tool-actions">
                  <button
                    disabled={guideStep === 0}
                    onClick={() => setGuideStep((step) => Math.max(step - 1, 0))}
                    type="button"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() =>
                      setGuideStep((step) => Math.min(step + 1, brushingSteps.length - 1))
                    }
                    type="button"
                  >
                    Siguiente paso
                  </button>
                </div>
              </div>

              <ol className="step-list">
                {brushingSteps.map((step, index) => (
                  <li className={index === guideStep ? "current" : ""} key={step.title}>
                    <button onClick={() => setGuideStep(index)} type="button">
                      <span>{index + 1}</span>
                      <strong>{step.title}</strong>
                      <small>{step.time}</small>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {activeTool === "evaluacion" && (
            <section className="quiz-tool">
              <div className="tool-copy">
                <span className="tool-badge">Evaluacion rapida</span>
                <h3>Responde y descubre tu nivel</h3>
                <p>
                  Marca una opcion por pregunta. Ceps calculara tu puntaje y te
                  dara una rutina diaria para mejorar.
                </p>
                <div className="score-ring" style={{ "--score": `${quizDone ? currentScore : 0}%` } as CSSProperties}>
                  <strong>{quizDone ? currentScore : 0}%</strong>
                  <span>{quizDone ? "completo" : "en curso"}</span>
                </div>
              </div>

              <div className="question-list">
                {quizQuestions.map((item, index) => (
                  <fieldset key={item.question}>
                    <legend>
                      {index + 1}. {item.question}
                    </legend>
                    {item.options.map((option, optionIndex) => (
                      <label
                        className={answers[index] === optionIndex ? "picked" : ""}
                        key={option}
                      >
                        <input
                          checked={answers[index] === optionIndex}
                          name={`question-${index}`}
                          onChange={() => answerQuestion(index, optionIndex)}
                          type="radio"
                        />
                        {option}
                      </label>
                    ))}
                  </fieldset>
                ))}

                <div className="quiz-actions">
                  <button onClick={() => setAnswers(emptyAnswers)} type="button">
                    Reiniciar
                  </button>
                  <button disabled={!quizDone} onClick={() => openTool("nivel")} type="button">
                    Ver mi nivel
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTool === "nivel" && (
            <section className="level-tool">
              <div className={`level-card ${level.className}`}>
                <span>{level.badge}</span>
                <h3>{level.name}</h3>
                <strong>{score}%</strong>
                <p>{level.message}</p>
              </div>

              <div className="daily-plan">
                <h3>Que debo hacer diariamente</h3>
                <ul>
                  {level.daily.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button onClick={() => openTool("dashboard")} type="button">
                  Llevarlo a mi racha
                </button>
              </div>
            </section>
          )}

          {activeTool === "dashboard" && (
            <section className="dashboard-tool" id="dashboard">
              <div className="streak-card">
                <span>Racha actual</span>
                <strong>{streak}</strong>
                <p>{streak === 1 ? "dia seguido" : "dias seguidos"}</p>
              </div>

              <div className="task-board">
                <div className="task-board-head">
                  <div>
                    <span className="tool-badge">Mision de hoy</span>
                    <h3>{progress}% completado</h3>
                  </div>
                  <div className="progress-track" aria-label={`Progreso ${progress}%`}>
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="task-list">
                  {dailyTasks.map((task, index) => (
                    <label className={checkedTasks[index] ? "done" : ""} key={task}>
                      <input
                        checked={checkedTasks[index]}
                        onChange={() => toggleTask(index)}
                        type="checkbox"
                      />
                      <span>{task}</span>
                    </label>
                  ))}
                </div>

                <div className="dashboard-actions">
                  <button disabled={!allDoneToday || lastCompleted === todayKey()} onClick={completeDay} type="button">
                    Completar dia
                  </button>
                  <button onClick={resetToday} type="button">
                    Reiniciar hoy
                  </button>
                </div>

                {lastCompleted === todayKey() && (
                  <p className="success-note">
                    Mision lista por hoy. Vuelve manana para mantener la racha.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </section>

      <footer className="footer" id="contacto">
        <div className="footer-mascot" aria-hidden="true">
          <span className="thumb" />
        </div>
        <div className="footer-main">
          <a className="footer-brand" href="#inicio">
            <Image src="/logo.png" alt="YoMeCepillo.cl" width={240} height={101} />
          </a>
          <nav aria-label="Navegacion secundaria">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => item.tool && setActiveTool(item.tool)}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="socials" aria-label="Redes sociales">
            <a href="#" aria-label="YouTube">
              YT
            </a>
            <a href="#" aria-label="Instagram">
              IG
            </a>
            <a href="#" aria-label="Facebook">
              f
            </a>
          </div>
        </div>
        <p>&copy; 2026 YoMeCepillo.cl &middot; Aprende a cuidar tu sonrisa.</p>
      </footer>
    </main>
  );
}
