"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Screen = "home" | "brush" | "floss" | "habits" | "progress" | "learn" | "profile";
type HabitKey = "brushMorning" | "brushNight" | "floss" | "tongue" | "water";

const habitLabels: Record<HabitKey, string> = {
  brushMorning: "Cepillado manana",
  brushNight: "Cepillado noche",
  floss: "Hilo dental",
  tongue: "Lengua limpia",
  water: "Tomar agua",
};

const habitKeys = Object.keys(habitLabels) as HabitKey[];

const lessonCards = [
  {
    title: "Errores comunes al cepillarse",
    time: "2:45 min",
    tag: "Cepillado",
    accent: "blue",
  },
  {
    title: "Por que usar hilo dental?",
    time: "1:58 min",
    tag: "Hilo dental",
    accent: "mint",
  },
  {
    title: "Como prevenir la gingivitis",
    time: "2:12 min",
    tag: "Encias",
    accent: "pink",
  },
  {
    title: "Caries entre los dientes",
    time: "2:30 min",
    tag: "Cuidados",
    accent: "yellow",
  },
];

const habitQuestion = {
  question: "Con que frecuencia usas hilo dental?",
  options: ["Nunca", "Algunas veces a la semana", "Casi todos los dias", "Todos los dias"],
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function emptyHabits(): Record<HabitKey, boolean> {
  return {
    brushMorning: false,
    brushNight: false,
    floss: false,
    tongue: false,
    water: false,
  };
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [habits, setHabits] = useState<Record<HabitKey, boolean>>(emptyHabits);
  const [streak, setStreak] = useState(0);
  const [lastCompleted, setLastCompleted] = useState("");
  const [habitAnswer, setHabitAnswer] = useState(3);
  const [brushingSeconds, setBrushingSeconds] = useState(120);
  const [isBrushing, setIsBrushing] = useState(false);
  const [flossDone, setFlossDone] = useState(false);

  const completedHabits = habitKeys.filter((key) => habits[key]).length;
  const hygieneScore = Math.round((completedHabits / habitKeys.length) * 100);
  const allHabitsDone = completedHabits === habitKeys.length;
  const brushingSegment = Math.min(3, Math.floor((120 - brushingSeconds) / 30));

  const weeklyScore = useMemo(() => {
    const answerBoost = [0, 12, 22, 30][habitAnswer];
    return Math.min(100, 52 + completedHabits * 6 + answerBoost);
  }, [completedHabits, habitAnswer]);

  useEffect(() => {
    window.setTimeout(() => {
      const storedHabits = localStorage.getItem(`ymc-app-day-${todayKey()}`);
      const storedStreak = Number(localStorage.getItem("ymc-app-streak") || "0");
      const storedLastCompleted = localStorage.getItem("ymc-app-last-completed") || "";
      const storedHabitAnswer = Number(localStorage.getItem("ymc-app-habit-answer") || "3");

      if (storedHabits) {
        setHabits(JSON.parse(storedHabits) as Record<HabitKey, boolean>);
      }

      setStreak(storedStreak);
      setLastCompleted(storedLastCompleted);
      setHabitAnswer(storedHabitAnswer);
      setFlossDone(storedHabits ? JSON.parse(storedHabits).floss : false);
    }, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem(`ymc-app-day-${todayKey()}`, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("ymc-app-habit-answer", String(habitAnswer));
  }, [habitAnswer]);

  useEffect(() => {
    if (!isBrushing || brushingSeconds <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setBrushingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [brushingSeconds, isBrushing]);

  useEffect(() => {
    if (brushingSeconds === 0) {
      setIsBrushing(false);
      setHabits((current) => ({ ...current, brushMorning: true, brushNight: true }));
    }
  }, [brushingSeconds]);

  function updateHabit(key: HabitKey, value = !habits[key]) {
    setHabits((current) => ({ ...current, [key]: value }));
  }

  function registerFloss() {
    setFlossDone(true);
    updateHabit("floss", true);
  }

  function completeDay() {
    const today = todayKey();

    if (!allHabitsDone || lastCompleted === today) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    const nextStreak = lastCompleted === yesterdayKey ? streak + 1 : 1;

    setStreak(nextStreak);
    setLastCompleted(today);
    localStorage.setItem("ymc-app-streak", String(nextStreak));
    localStorage.setItem("ymc-app-last-completed", today);
  }

  function resetBrushTimer() {
    setBrushingSeconds(120);
    setIsBrushing(false);
  }

  return (
    <main className="app-page">
      <div className="phone-frame">
        <section className={`app-screen ${screen === "brush" ? "full-focus" : ""}`}>
          <StatusBar />

          {screen !== "home" && (
            <button className="back-button" onClick={() => setScreen("home")} type="button">
              Atrás
            </button>
          )}

          {screen === "home" && (
            <HomeScreen
              hygieneScore={hygieneScore}
              habits={habits}
              streak={streak}
              setScreen={setScreen}
              completeDay={completeDay}
              lastCompleted={lastCompleted}
              allHabitsDone={allHabitsDone}
            />
          )}

          {screen === "brush" && (
            <BrushScreen
              seconds={brushingSeconds}
              isRunning={isBrushing}
              segment={brushingSegment}
              onToggle={() => setIsBrushing((current) => !current)}
              onReset={resetBrushTimer}
            />
          )}

          {screen === "floss" && <FlossScreen flossDone={flossDone} onDone={registerFloss} />}

          {screen === "habits" && (
            <HabitsScreen
              answer={habitAnswer}
              onAnswer={setHabitAnswer}
              onNext={() => setScreen("progress")}
            />
          )}

          {screen === "progress" && (
            <ProgressScreen
              weeklyScore={weeklyScore}
              streak={streak}
              habits={habits}
              setScreen={setScreen}
            />
          )}

          {screen === "learn" && <LearnScreen />}

          {screen === "profile" && (
            <ProfileScreen
              hygieneScore={hygieneScore}
              streak={streak}
              onReset={() => {
                setHabits(emptyHabits());
                setStreak(0);
                setLastCompleted("");
                localStorage.clear();
              }}
            />
          )}

          <BottomNav screen={screen} setScreen={setScreen} />
        </section>
      </div>
    </main>
  );
}

function StatusBar() {
  return (
    <div className="status-bar" aria-hidden="true">
      <span>9:41</span>
      <span>●●●</span>
    </div>
  );
}

function HomeScreen({
  hygieneScore,
  habits,
  streak,
  setScreen,
  completeDay,
  lastCompleted,
  allHabitsDone,
}: {
  hygieneScore: number;
  habits: Record<HabitKey, boolean>;
  streak: number;
  setScreen: (screen: Screen) => void;
  completeDay: () => void;
  lastCompleted: string;
  allHabitsDone: boolean;
}) {
  return (
    <div className="screen-content home-view">
      <header className="home-top">
        <button aria-label="Menu" className="icon-button menu-icon" type="button">
          <span />
        </button>
        <Image src="/logo.png" alt="YoMeCepillo.cl" width={190} height={80} priority />
        <button aria-label="Notificaciones" className="icon-button bell-icon" type="button">
          <span />
        </button>
      </header>

      <div className="hello-block">
        <h1>Hola, Ana!</h1>
        <p>Lista para cuidar tu sonrisa hoy</p>
      </div>

      <section className="score-card">
        <span>Tu higiene hoy</span>
        <div className="score-circle">
          <strong>{hygieneScore}%</strong>
          <small>{hygieneScore >= 80 ? "Muy bien!" : "Vamos!"}</small>
        </div>
      </section>

      <div className="habit-shortcuts">
        <button className="mini-habit" onClick={() => setScreen("brush")} type="button">
          <span className="habit-illustration brush-small" />
          <strong>Cepillado</strong>
          <small>2 veces al dia</small>
          <i className={habits.brushMorning && habits.brushNight ? "check active" : "check"} />
        </button>
        <button className="mini-habit" onClick={() => setScreen("floss")} type="button">
          <span className="habit-illustration floss-small" />
          <strong>Hilo dental</strong>
          <small>1 vez al dia</small>
          <i className={habits.floss ? "check active" : "check"} />
        </button>
      </div>

      <section className="streak-panel">
        <div>
          <span>Racha actual</span>
          <strong>{streak} dias</strong>
          <p>Sigue asi!</p>
        </div>
        <div className="tiny-tooth" aria-hidden="true" />
      </section>

      <section className="tip-card">
        <span className="tip-icon" aria-hidden="true" />
        <div>
          <strong>Consejo del dia</strong>
          <p>Usar hilo dental previene caries entre los dientes.</p>
        </div>
      </section>

      <button
        className="primary-action"
        disabled={!allHabitsDone || lastCompleted === todayKey()}
        onClick={completeDay}
        type="button"
      >
        Registrar dia completo
      </button>
    </div>
  );
}

function BrushScreen({
  seconds,
  isRunning,
  segment,
  onToggle,
  onReset,
}: {
  seconds: number;
  isRunning: boolean;
  segment: number;
  onToggle: () => void;
  onReset: () => void;
}) {
  const zones = ["Superior izquierda", "Superior derecha", "Inferior derecha", "Inferior izquierda"];

  return (
    <div className="screen-content brush-view">
      <header className="simple-title">
        <h1>Cepillado</h1>
        <p>Vamos a cepillarnos!</p>
      </header>

      <div className="timer-display">
        <strong>{formatTime(seconds)}</strong>
        <span>Tiempo restante</span>
      </div>

      <div className="mouth-stage" aria-label="Zonas de cepillado">
        <div className="mouth">
          {zones.map((zone, index) => (
            <span className={index === segment ? "zone active" : "zone"} key={zone} />
          ))}
          <button className="pause-button" onClick={onToggle} type="button">
            {isRunning ? "Pausa" : "Iniciar"}
          </button>
        </div>
      </div>

      <p className="brush-instruction">Cepilla suavemente cada zona.</p>

      <div className="zone-list">
        {zones.map((zone, index) => (
          <span className={index === segment ? "active" : ""} key={zone}>
            {zone}
          </span>
        ))}
      </div>

      <section className="soft-note">
        <strong>Consejo</strong>
        <p>Inclina el cepillo 45 grados hacia la encia y realiza movimientos circulares suaves.</p>
      </section>

      <button className="secondary-action" onClick={onReset} type="button">
        Reiniciar temporizador
      </button>
    </div>
  );
}

function FlossScreen({ flossDone, onDone }: { flossDone: boolean; onDone: () => void }) {
  return (
    <div className="screen-content floss-view">
      <header className="simple-title left">
        <h1>Usa hilo dental todos los dias</h1>
        <p>El cepillo no limpia entre los dientes.</p>
      </header>

      <div className="floss-hero" aria-hidden="true">
        <div className="gum" />
        <div className="teeth-row">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="floss-line" />
      </div>

      <div className="floss-steps">
        {["Toma el hilo con ambos dedos", "Deslizalo suavemente", "Haz forma de C y limpia"].map(
          (step, index) => (
            <article key={step}>
              <span>{index + 1}</span>
              <div className="hand-icon" />
              <p>{step}</p>
            </article>
          ),
        )}
      </div>

      <button className="primary-action" onClick={onDone} type="button">
        {flossDone ? "Hilo dental registrado" : "Registrar que lo hice"}
      </button>

      <section className="soft-note">
        <strong>Sabias que?</strong>
        <p>Usar hilo dental a diario puede prevenir gingivitis y mal aliento.</p>
      </section>
    </div>
  );
}

function HabitsScreen({
  answer,
  onAnswer,
  onNext,
}: {
  answer: number;
  onAnswer: (answer: number) => void;
  onNext: () => void;
}) {
  return (
    <div className="screen-content habits-view">
      <header className="question-header">
        <span>Mis habitos</span>
        <small>1/6</small>
      </header>

      <h1>{habitQuestion.question}</h1>

      <div className="answer-list">
        {habitQuestion.options.map((option, index) => (
          <button
            className={answer === index ? "selected" : ""}
            key={option}
            onClick={() => onAnswer(index)}
            type="button"
          >
            <span className="answer-icon" />
            {option}
            <i />
          </button>
        ))}
      </div>

      <div className="mascot-card">
        <div className="tiny-tooth large" aria-hidden="true" />
      </div>

      <button className="primary-action" onClick={onNext} type="button">
        Siguiente
      </button>
    </div>
  );
}

function ProgressScreen({
  weeklyScore,
  streak,
  habits,
  setScreen,
}: {
  weeklyScore: number;
  streak: number;
  habits: Record<HabitKey, boolean>;
  setScreen: (screen: Screen) => void;
}) {
  return (
    <div className="screen-content progress-view">
      <header className="screen-title-row">
        <h1>Mi progreso</h1>
        <button className="calendar-button" type="button">Cal</button>
      </header>

      <div className="segmented-control">
        <button className="active" type="button">Semana</button>
        <button type="button">Mes</button>
        <button type="button">Total</button>
      </div>

      <p className="date-range">13 - 19 de mayo</p>

      <section className="weekly-card">
        <div>
          <span>Puntuacion semanal</span>
          <strong>{weeklyScore}%</strong>
          <p>Excelente trabajo!</p>
        </div>
        <div className="trophy" aria-hidden="true" />
      </section>

      <section className="summary-list">
        <h2>Resumen</h2>
        <ProgressRow label="Cepillado" value={habits.brushMorning && habits.brushNight ? "14 / 14 veces" : "En progreso"} />
        <ProgressRow label="Hilo dental" value={habits.floss ? "6 / 7 veces" : "Pendiente"} />
        <ProgressRow label="Racha actual" value={`${streak} dias`} />
      </section>

      <section className="badges">
        <h2>Insignias recientes</h2>
        <div>
          <button onClick={() => setScreen("brush")} type="button">7 dias cepillado</button>
          <button onClick={() => setScreen("floss")} type="button">Hilo dental constante</button>
          <button onClick={() => setScreen("learn")} type="button">Encias saludables</button>
        </div>
      </section>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="progress-row">
      <span>{label}</span>
      <strong>{value}</strong>
      <i />
    </div>
  );
}

function LearnScreen() {
  return (
    <div className="screen-content learn-view">
      <header className="simple-title">
        <h1>Aprender</h1>
        <p>Cuida tu boca, previene problemas.</p>
      </header>

      <div className="learning-tabs">
        <button className="active" type="button">Todo</button>
        <button type="button">Cepillado</button>
        <button type="button">Hilo dental</button>
        <button type="button">Encias</button>
      </div>

      <div className="lesson-list">
        {lessonCards.map((lesson) => (
          <article className={`lesson-card ${lesson.accent}`} key={lesson.title}>
            <div>
              <h2>{lesson.title}</h2>
              <span>{lesson.time}</span>
            </div>
            <div className="lesson-image" aria-hidden="true">
              <span />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen({
  hygieneScore,
  streak,
  onReset,
}: {
  hygieneScore: number;
  streak: number;
  onReset: () => void;
}) {
  return (
    <div className="screen-content profile-view">
      <div className="profile-card">
        <div className="tiny-tooth large" aria-hidden="true" />
        <h1>Ana</h1>
        <p>Cuidadora de sonrisas</p>
      </div>

      <div className="profile-stats">
        <span>
          <strong>{hygieneScore}%</strong>
          higiene
        </span>
        <span>
          <strong>{streak}</strong>
          racha
        </span>
      </div>

      <button className="secondary-action" onClick={onReset} type="button">
        Reiniciar progreso local
      </button>
    </div>
  );
}

function BottomNav({
  screen,
  setScreen,
}: {
  screen: Screen;
  setScreen: (screen: Screen) => void;
}) {
  const items: Array<{ screen: Screen; label: string; icon: string }> = [
    { screen: "home", label: "Inicio", icon: "home" },
    { screen: "progress", label: "Progreso", icon: "bars" },
    { screen: "brush", label: "Cepillar", icon: "plus" },
    { screen: "learn", label: "Aprender", icon: "book" },
    { screen: "profile", label: "Perfil", icon: "user" },
  ];

  return (
    <nav className="bottom-nav" aria-label="Navegacion de la app">
      {items.map((item) => (
        <button
          className={`${screen === item.screen ? "active" : ""} ${item.icon === "plus" ? "center-action" : ""}`}
          key={item.screen}
          onClick={() => setScreen(item.screen)}
          type="button"
        >
          <span className={`nav-icon ${item.icon}`} aria-hidden="true" />
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}
