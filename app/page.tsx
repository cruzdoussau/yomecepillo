"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useState } from "react";

type Screen = "home" | "brush" | "interdental" | "learn" | "test" | "progress" | "profile";
type InterdentalMethodId = "floss" | "picks" | "brushes";
type VideoId = "toothbrushBetweenTeeth" | "floss" | "picks" | "interdentalBrush";
type VideoCategory = "all" | "brushing" | "floss" | "gums";
type TestKey = "bleeding" | "braces" | "wideSpaces" | "sensitivity" | "implants";

type StoredState = {
  points: number;
  streak: number;
  lastCompleted: string;
  childName: string;
  childAge: string;
  brushToday: boolean;
  interdentalToday: boolean;
  completedVideos: VideoId[];
  completedQuizzes: VideoId[];
  badges: string[];
  testAnswers: Record<TestKey, boolean>;
};

const brushZones = [
  "Superior derecha",
  "Superior izquierda",
  "Inferior derecha",
  "Inferior izquierda",
];

const bassTips = [
  "Cepillo a 45° hacia la encía.",
  "Movimientos vibratorios suaves.",
  "Barrido hacia el borde dental.",
];

const interdentalMethods: Array<{
  id: InterdentalMethodId;
  title: string;
  short: string;
  recommended: string;
  steps: string[];
  color: string;
}> = [
  {
    id: "floss",
    title: "Hilo dental tradicional",
    short: "Limpia los espacios cerrados entre dientes con control y suavidad.",
    recommended: "Recomendado si tienes espacios pequeños y buena destreza manual.",
    steps: [
      "Introducir suavemente.",
      "Formar una C alrededor del diente.",
      "Limpiar ambas caras.",
      "No golpear la encía.",
    ],
    color: "teal",
  },
  {
    id: "picks",
    title: "Ganchitos de hilo dental",
    short: "Una alternativa simple para llegar a zonas posteriores.",
    recommended: "Ideal para principiantes o personas con menor destreza manual.",
    steps: [
      "Sujetar el mango.",
      "Introducir suavemente entre los dientes.",
      "Limpiar ambos lados.",
      "Cambiar de zona con calma.",
    ],
    color: "orange",
  },
  {
    id: "brushes",
    title: "Cepillos interdentales",
    short: "Ayudan cuando hay espacios más amplios entre dientes.",
    recommended: "Ideal para espacios amplios, ortodoncia, implantes o retracción gingival.",
    steps: [
      "Elegir el tamaño adecuado.",
      "Introducir sin forzar.",
      "Mover suavemente hacia adelante y atrás.",
      "Enjuagar al terminar.",
    ],
    color: "blue",
  },
];

const videos: Array<{
  id: VideoId;
  title: string;
  duration: string;
  src: string;
  icon: string;
  category: Exclude<VideoCategory, "all">;
  description: string;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
}> = [
  {
    id: "toothbrushBetweenTeeth",
    title: "Cepillado entre los dientes",
    duration: "Video guía",
    src: "/videos/como%20pasar%20el%20cepillo%20entre%20los%20dientes.mp4",
    icon: "brush",
    category: "brushing",
    description: "Aprende cómo ubicar el cepillo y limpiar los espacios de forma suave.",
    questions: [
      {
        question: "¿Qué debes evitar al cepillar entre los dientes?",
        options: ["Movimientos suaves", "Forzar el cepillo", "Avanzar con calma"],
        correct: 1,
      },
      {
        question: "¿Cómo debe sentirse el movimiento?",
        options: ["Suave y controlado", "Rápido y fuerte", "Con dolor"],
        correct: 0,
      },
    ],
  },
  {
    id: "floss",
    title: "Hilo dental tradicional",
    duration: "Video guía",
    src: "/videos/como%20pasar%20el%20hilo%20dental.mp4",
    icon: "floss",
    category: "floss",
    description: "Practica el recorrido del hilo dental para limpiar ambas caras del diente.",
    questions: [
      {
        question: "¿Qué forma debe hacer el hilo alrededor del diente?",
        options: ["Forma de C", "Línea recta", "Nudo"],
        correct: 0,
      },
      {
        question: "¿Qué debes evitar?",
        options: ["Entrar suave", "Golpear la encía", "Limpiar ambas caras"],
        correct: 1,
      },
    ],
  },
  {
    id: "picks",
    title: "Gancho de hilo dental",
    duration: "Video guía",
    src: "/videos/como%20pasar%20el%20gancho%20de%20hilo%20dental.mp4",
    icon: "pick",
    category: "floss",
    description: "Alternativa práctica para zonas posteriores o para comenzar con hilo dental.",
    questions: [
      {
        question: "¿Para quién son útiles los ganchitos?",
        options: ["Principiantes", "Solo dentistas", "Nadie"],
        correct: 0,
      },
      {
        question: "¿Cómo se introducen?",
        options: ["Con fuerza", "Suavemente", "Mordiendo"],
        correct: 1,
      },
    ],
  },
  {
    id: "interdentalBrush",
    title: "Cepillo interproximal",
    duration: "Video guía",
    src: "/videos/como%20pasar%20cepillo%20interproximal.mp4",
    icon: "interdental",
    category: "gums",
    description: "Una técnica útil para cuidar encías y espacios más amplios sin lastimar.",
    questions: [
      {
        question: "¿Cuándo ayuda más el cepillo interproximal?",
        options: ["Espacios amplios", "Dientes sin espacio", "Solo lengua"],
        correct: 0,
      },
      {
        question: "¿Qué debes evitar?",
        options: ["No forzar", "Forzar el cepillo", "Mover suave"],
        correct: 1,
      },
    ],
  },
];

const videoCategories: Array<{ id: VideoCategory; label: string }> = [
  { id: "all", label: "Todo" },
  { id: "brushing", label: "Cepillado" },
  { id: "floss", label: "Hilo dental" },
  { id: "gums", label: "Encías" },
];

const testQuestions: Array<{ key: TestKey; question: string }> = [
  { key: "bleeding", question: "¿Tus encías sangran?" },
  { key: "braces", question: "¿Usas ortodoncia?" },
  { key: "wideSpaces", question: "¿Tienes espacios amplios entre dientes?" },
  { key: "sensitivity", question: "¿Tienes sensibilidad?" },
  { key: "implants", question: "¿Usas implantes?" },
];

const initialTestAnswers: Record<TestKey, boolean> = {
  bleeding: false,
  braces: false,
  wideSpaces: false,
  sensitivity: false,
  implants: false,
};

const initialState: StoredState = {
  points: 0,
  streak: 0,
  lastCompleted: "",
  childName: "",
  childAge: "",
  brushToday: false,
  interdentalToday: false,
  completedVideos: [],
  completedQuizzes: [],
  badges: [],
  testAnswers: initialTestAnswers,
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getLevel(points: number) {
  if (points >= 1001) {
    return { name: "Experto", message: "Dominas una rutina completa y constante." };
  }

  if (points >= 501) {
    return { name: "Intermedio", message: "Vas muy bien. Falta consolidar hábitos diarios." };
  }

  return { name: "Principiante", message: "Estás comenzando. Ceps te acompaña paso a paso." };
}

function getRecommendation(answers: Record<TestKey, boolean>) {
  if (answers.implants || answers.braces || answers.wideSpaces) {
    return {
      title: "Cepillo interdental",
      body: "Ceps recomienda cepillos interdentales porque ayudan en espacios amplios, ortodoncia, implantes o retracción gingival.",
    };
  }

  if (answers.sensitivity) {
    return {
      title: "Ganchitos de hilo dental",
      body: "Puede ser más cómodo comenzar con ganchitos, usando movimientos suaves y sin presionar la encía.",
    };
  }

  if (answers.bleeding) {
    return {
      title: "Bass Modificada + hilo dental",
      body: "La técnica Bass Modificada ayuda a limpiar cerca de la encía con suavidad. Si el sangrado continúa, consulta a un profesional.",
    };
  }

  return {
    title: "Hilo dental tradicional",
    body: "Es una gran opción para espacios pequeños. Forma una C alrededor del diente y limpia ambas caras.",
  };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [state, setState] = useState<StoredState>(initialState);
  const [brushSeconds, setBrushSeconds] = useState(120);
  const [brushRunning, setBrushRunning] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<InterdentalMethodId>("floss");
  const [activeVideo, setActiveVideo] = useState<VideoId>("toothbrushBetweenTeeth");
  const [activeVideoCategory, setActiveVideoCategory] = useState<VideoCategory>("all");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const completedDaily = Number(state.brushToday) + Number(state.interdentalToday);
  const hygieneScore = Math.round((completedDaily / 2) * 100);
  const level = getLevel(state.points);
  const recommendation = getRecommendation(state.testAnswers);
  const currentZone = Math.min(3, Math.floor((120 - brushSeconds) / 30));
  const activeVideoData = videos.find((video) => video.id === activeVideo) ?? videos[0];
  const selectedMethodData =
    interdentalMethods.find((method) => method.id === selectedMethod) ?? interdentalMethods[0];

  useEffect(() => {
    window.setTimeout(() => {
      const stored = localStorage.getItem("ymc-education-app");
      const storedDay = localStorage.getItem("ymc-education-day");

      if (stored) {
        const parsed = JSON.parse(stored) as StoredState;
        const isToday = storedDay === todayKey();
        setState({
          ...initialState,
          ...parsed,
          brushToday: isToday ? parsed.brushToday : false,
          interdentalToday: isToday ? parsed.interdentalToday : false,
        });
      }
    }, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("ymc-education-app", JSON.stringify(state));
    localStorage.setItem("ymc-education-day", todayKey());
  }, [state]);

  useEffect(() => {
    if (!brushRunning || brushSeconds <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setBrushSeconds((current) => {
        if (current <= 1) {
          setBrushRunning(false);
          setState((stored) => ({
            ...stored,
            brushToday: true,
            points: stored.brushToday ? stored.points : stored.points + 50,
            badges: stored.badges.includes("Aprendiz de Bass")
              ? stored.badges
              : [...stored.badges, "Aprendiz de Bass"],
          }));
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [brushRunning, brushSeconds]);

  function addPoints(points: number) {
    setState((current) => ({ ...current, points: current.points + points }));
  }

  function unlockBrushCompletion() {
    setBrushRunning(false);
    setState((current) => ({
      ...current,
      brushToday: true,
      points: current.points + 50,
      badges: current.badges.includes("Aprendiz de Bass")
        ? current.badges
        : [...current.badges, "Aprendiz de Bass"],
    }));
  }

  function registerInterdental(methodId: InterdentalMethodId) {
    const badge =
      methodId === "brushes" ? "Experto en limpieza interdental" : "Héroe del hilo dental";

    setState((current) => ({
      ...current,
      interdentalToday: true,
      points: current.points + 35,
      badges: current.badges.includes(badge) ? current.badges : [...current.badges, badge],
    }));
  }

  function completeVideo(videoId: VideoId) {
    setState((current) => {
      if (current.completedVideos.includes(videoId)) {
        return current;
      }

      return {
        ...current,
        points: current.points + 25,
        completedVideos: [...current.completedVideos, videoId],
      };
    });
  }

  function selectQuizAnswer(videoId: VideoId, questionIndex: number, optionIndex: number) {
    const key = `${videoId}-${questionIndex}`;
    setQuizAnswers((current) => ({ ...current, [key]: optionIndex }));
  }

  function resetQuiz(videoId: VideoId) {
    setQuizAnswers((current) => {
      const nextAnswers = { ...current };
      const video = videos.find((item) => item.id === videoId);

      video?.questions.forEach((_, questionIndex) => {
        delete nextAnswers[`${videoId}-${questionIndex}`];
      });

      return nextAnswers;
    });
  }

  function validateQuiz(videoId: VideoId) {
    const video = videos.find((item) => item.id === videoId);

    if (!video) {
      return { complete: false, correctCount: 0, total: 0, awarded: false };
    }

    const isComplete = video.questions.every((_, questionIndex) => quizAnswers[`${videoId}-${questionIndex}`] !== undefined);
    const correctCount = video.questions.reduce((total, question, questionIndex) => {
      return total + (quizAnswers[`${videoId}-${questionIndex}`] === question.correct ? 1 : 0);
    }, 0);

    if (!isComplete) {
      return { complete: false, correctCount, total: video.questions.length, awarded: false };
    }

    let awarded = false;

    setState((current) => {
      if (current.completedQuizzes.includes(videoId) || correctCount === 0) {
        return current;
      }

      awarded = true;

      return {
        ...current,
        points: current.points + correctCount * 15,
        completedQuizzes: [...current.completedQuizzes, videoId],
      };
    });

    return { complete: true, correctCount, total: video.questions.length, awarded };
  }

  function toggleTestAnswer(key: TestKey) {
    setState((current) => ({
      ...current,
      testAnswers: { ...current.testAnswers, [key]: !current.testAnswers[key] },
    }));
  }

  function saveChildProfile(name: string, age: string) {
    setState((current) => ({
      ...current,
      childName: name.trim(),
      childAge: age.trim(),
    }));
  }

  function completeDay() {
    if (!state.brushToday || !state.interdentalToday || state.lastCompleted === todayKey()) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    const nextStreak = state.lastCompleted === yesterdayKey ? state.streak + 1 : 1;
    const firstWeekBadge = nextStreak >= 7 ? ["Primera semana"] : [];

    setState((current) => ({
      ...current,
      streak: nextStreak,
      lastCompleted: todayKey(),
      points: current.points + 30,
      badges: Array.from(new Set([...current.badges, ...firstWeekBadge, "Encías saludables"])),
    }));
  }

  function resetLocalProgress() {
    localStorage.removeItem("ymc-education-app");
    localStorage.removeItem("ymc-education-day");
    setState(initialState);
    setBrushSeconds(120);
    setBrushRunning(false);
    setQuizAnswers({});
  }

  return (
    <main className="app-page">
      <div className="phone-frame">
        <section className="app-screen">
          <StatusBar />

          {screen !== "home" && <InternalHeader onBack={() => setScreen("home")} />}

          {screen === "home" && (
            <HomeScreen
              hygieneScore={hygieneScore}
              level={level.name}
              state={state}
              setScreen={setScreen}
              saveChildProfile={saveChildProfile}
            />
          )}

          {screen === "brush" && (
            <BrushTrainingScreen
              seconds={brushSeconds}
              running={brushRunning}
              currentZone={currentZone}
              onToggle={() => setBrushRunning((current) => !current)}
              onFinish={() => {
                setBrushSeconds(0);
                unlockBrushCompletion();
              }}
              onReset={() => {
                setBrushSeconds(120);
                setBrushRunning(false);
              }}
              completed={state.brushToday}
            />
          )}

          {screen === "interdental" && (
            <InterdentalScreen
              selectedMethod={selectedMethod}
              method={selectedMethodData}
              setSelectedMethod={setSelectedMethod}
              registerInterdental={registerInterdental}
              completed={state.interdentalToday}
            />
          )}

          {screen === "learn" && (
            <LearnScreen
              activeVideo={activeVideo}
              activeVideoCategory={activeVideoCategory}
              setActiveVideo={setActiveVideo}
              setActiveVideoCategory={setActiveVideoCategory}
              activeVideoData={activeVideoData}
              completedVideos={state.completedVideos}
              onVideoEnded={completeVideo}
              quizAnswers={quizAnswers}
              selectQuizAnswer={selectQuizAnswer}
              resetQuiz={resetQuiz}
              validateQuiz={validateQuiz}
              completedQuizzes={state.completedQuizzes}
            />
          )}

          {screen === "test" && (
            <TechniqueTestScreen
              answers={state.testAnswers}
              toggleAnswer={toggleTestAnswer}
              recommendation={recommendation}
              setScreen={setScreen}
            />
          )}

          {screen === "progress" && (
            <ProgressScreen
              hygieneScore={hygieneScore}
              state={state}
              level={level}
              setScreen={setScreen}
            />
          )}

          {screen === "profile" && (
            <ProfileScreen
              state={state}
              level={level.name}
              resetLocalProgress={resetLocalProgress}
            />
          )}

          {screen !== "home" && <BottomNav screen={screen} setScreen={setScreen} />}
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

function InternalHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="internal-header">
      <Image src="/logo.png" alt="YoMeCepillo.cl" width={230} height={96} priority />
      <button className="back-button" onClick={onBack} type="button">
        Atrás
      </button>
    </header>
  );
}

function CepsGuide({ message }: { message: string }) {
  return (
    <div className="ceps-guide">
      <div className="tiny-tooth" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

function HomeScreen({
  hygieneScore,
  level,
  state,
  setScreen,
  saveChildProfile,
}: {
  hygieneScore: number;
  level: string;
  state: StoredState;
  setScreen: (screen: Screen) => void;
  saveChildProfile: (name: string, age: string) => void;
}) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [childName, setChildName] = useState(state.childName);
  const [childAge, setChildAge] = useState(state.childAge);
  const hasProfile = Boolean(state.childName && state.childAge);

  function submitWelcome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!childName.trim() || !childAge.trim()) {
      return;
    }

    saveChildProfile(childName, childAge);
    setShowWelcome(false);
  }

  return (
    <div className="screen-content home-view game-home">
      <Image
        alt="Ceps aprende a cepillarte y cuida tu sonrisa"
        className="game-home-art"
        fill
        priority
        sizes="430px"
        src="/assets/ceps-home.jpg"
      />
      <div className="game-home-overlay" aria-hidden="true" />

      <header className="game-home-header">
        <Image src="/logo.png" alt="YoMeCepillo.cl" width={270} height={112} priority />
      </header>

      <section className="game-home-content" aria-label="Inicio de Ceps">
        <div className="game-home-stats">
          <span>{hasProfile ? state.childName : "Nuevo"}</span>
          <span>{state.points} puntos</span>
          <span>{level}</span>
        </div>

        {!hasProfile && (
          <button className="start-game-button" onClick={() => setShowWelcome(true)} type="button">
            <span>¡Comenzar!</span>
            <i aria-hidden="true" />
          </button>
        )}

        {hasProfile && (
          <div className="game-home-actions" aria-label="Accesos principales">
            <button className="game-action aprende" onClick={() => setScreen("learn")} type="button">
              <span className="game-action-icon" aria-hidden="true" />
              <strong>Aprende</strong>
            </button>
            <button className="game-action cuida" onClick={() => setScreen("brush")} type="button">
              <span className="game-action-icon" aria-hidden="true" />
              <strong>Cuida</strong>
            </button>
            <button className="game-action juega" onClick={() => setScreen("interdental")} type="button">
              <span className="game-action-icon" aria-hidden="true" />
              <strong>Juega</strong>
            </button>
            <button className="game-action progresa" onClick={() => setScreen("progress")} type="button">
              <span className="game-action-icon" aria-hidden="true" />
              <strong>Progresa</strong>
            </button>
          </div>
        )}
      </section>

      {showWelcome && (
        <div className="welcome-sheet" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
          <form className="welcome-card" onSubmit={submitWelcome}>
            <div className="welcome-tooth" aria-hidden="true" />
            <h1 id="welcome-title">Bienvenido a YoMeCepillo</h1>
            <p>
              Donde podras cuidar tu higiene oral de forma interactiva. Para continuar, por favor
              indicanos tu nombre y edad.
            </p>

            <label>
              Nombre
              <input
                autoComplete="given-name"
                maxLength={24}
                onChange={(event) => setChildName(event.target.value)}
                placeholder="Escribe tu nombre"
                type="text"
                value={childName}
              />
            </label>

            <label>
              Edad
              <input
                inputMode="numeric"
                maxLength={2}
                onChange={(event) => setChildAge(event.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 8"
                type="text"
                value={childAge}
              />
            </label>

            <button className="welcome-submit" disabled={!childName.trim() || !childAge.trim()} type="submit">
              Entrar a YoMeCepillo
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function BrushTrainingScreen({
  seconds,
  running,
  currentZone,
  completed,
  onToggle,
  onFinish,
  onReset,
}: {
  seconds: number;
  running: boolean;
  currentZone: number;
  completed: boolean;
  onToggle: () => void;
  onFinish: () => void;
  onReset: () => void;
}) {
  return (
    <div className="screen-content brush-view">
      <header className="simple-title">
        <h1>Entrena tu cepillado</h1>
        <p>Técnica Bass Modificada en 4 zonas.</p>
      </header>

      <div className="timer-display">
        <strong>{formatTime(seconds)}</strong>
        <span>Tiempo restante</span>
      </div>

      <div className="mouth-stage" aria-label="Zonas de cepillado">
        <div className="mouth">
          {brushZones.map((zone, index) => (
            <span className={index === currentZone ? "zone active" : "zone"} key={zone} />
          ))}
          <button className="pause-button" onClick={onToggle} type="button">
            {running ? "Pausa" : "Iniciar"}
          </button>
        </div>
      </div>

      <div className="zone-list">
        {brushZones.map((zone, index) => (
          <span className={index === currentZone ? "active" : ""} key={zone}>
            {zone}
          </span>
        ))}
      </div>

      <section className="technique-card">
        <h2>Indicaciones</h2>
        {bassTips.map((tip) => (
          <p key={tip}>{tip}</p>
        ))}
      </section>

      {completed && (
        <section className="achievement-card">
          <strong>Insignia desbloqueada</strong>
          <p>Aprendiz de Bass · +50 puntos</p>
        </section>
      )}

      <div className="dual-actions">
        <button className="secondary-action" onClick={onReset} type="button">
          Reiniciar
        </button>
        <button className="primary-action" onClick={onFinish} type="button">
          Finalizar rutina
        </button>
      </div>
    </div>
  );
}

function InterdentalScreen({
  selectedMethod,
  method,
  completed,
  setSelectedMethod,
  registerInterdental,
}: {
  selectedMethod: InterdentalMethodId;
  method: (typeof interdentalMethods)[number];
  completed: boolean;
  setSelectedMethod: (method: InterdentalMethodId) => void;
  registerInterdental: (method: InterdentalMethodId) => void;
}) {
  return (
    <div className="screen-content interdental-view">
      <header className="simple-title left">
        <h1>Limpieza interdental</h1>
        <p>Elige la herramienta que mejor se adapta a tu boca.</p>
      </header>

      <div className="method-tabs">
        {interdentalMethods.map((item) => (
          <button
            className={selectedMethod === item.id ? "active" : ""}
            key={item.id}
            onClick={() => setSelectedMethod(item.id)}
            type="button"
          >
            {item.title.replace(" dental", "")}
          </button>
        ))}
      </div>

      <section className={`method-card ${method.color}`}>
        <div>
          <span>Herramienta recomendada</span>
          <h2>{method.title}</h2>
          <p>{method.short}</p>
        </div>
        <div className={`method-visual ${method.id}`} aria-hidden="true" />
      </section>

      <section className="recommendation-card">
        <strong>¿Para quién se recomienda?</strong>
        <p>{method.recommended}</p>
      </section>

      <div className="visual-steps">
        {method.steps.map((step, index) => (
          <article key={step}>
            <span>{index + 1}</span>
            <div className="hand-icon" />
            <p>{step}</p>
          </article>
        ))}
      </div>

      <button className="primary-action" onClick={() => registerInterdental(method.id)} type="button">
        {completed ? "Registrado hoy" : "Lo hice hoy · +35 puntos"}
      </button>
    </div>
  );
}

function LearnScreen({
  activeVideo,
  activeVideoCategory,
  activeVideoData,
  completedVideos,
  completedQuizzes,
  quizAnswers,
  setActiveVideo,
  setActiveVideoCategory,
  onVideoEnded,
  selectQuizAnswer,
  resetQuiz,
  validateQuiz,
}: {
  activeVideo: VideoId;
  activeVideoCategory: VideoCategory;
  activeVideoData: (typeof videos)[number];
  completedVideos: VideoId[];
  completedQuizzes: VideoId[];
  quizAnswers: Record<string, number>;
  setActiveVideo: (video: VideoId) => void;
  setActiveVideoCategory: (category: VideoCategory) => void;
  onVideoEnded: (video: VideoId) => void;
  selectQuizAnswer: (video: VideoId, questionIndex: number, optionIndex: number) => void;
  resetQuiz: (video: VideoId) => void;
  validateQuiz: (video: VideoId) => { complete: boolean; correctCount: number; total: number; awarded: boolean };
}) {
  const completed = completedVideos.includes(activeVideo);
  const quizAwarded = completedQuizzes.includes(activeVideo);
  const [quizResult, setQuizResult] = useState<{
    videoId: VideoId;
    complete: boolean;
    correctCount: number;
    total: number;
    awarded: boolean;
  } | null>(null);
  const visibleVideos =
    activeVideoCategory === "all"
      ? videos
      : videos.filter((video) => video.category === activeVideoCategory);

  function selectCategory(category: VideoCategory) {
    const nextVideo = category === "all" ? videos[0] : videos.find((video) => video.category === category);

    setActiveVideoCategory(category);

    if (nextVideo) {
      setActiveVideo(nextVideo.id);
      setQuizResult(null);
    }
  }

  function handleValidateQuiz() {
    const result = validateQuiz(activeVideoData.id);
    setQuizResult({
      videoId: activeVideoData.id,
      ...result,
      awarded: result.complete && result.correctCount > 0 && !quizAwarded,
    });
  }

  function handleResetQuiz() {
    resetQuiz(activeVideoData.id);
    setQuizResult(null);
  }

  return (
    <div className="screen-content learn-view">
      <header className="simple-title">
        <h1>Reforzar higiene</h1>
        <p>Aprende cómo aplicar cada técnica paso a paso.</p>
      </header>

      <div className="learning-tabs" aria-label="Filtrar videos por tecnica">
        {videoCategories.map((category) => (
          <button
            className={activeVideoCategory === category.id ? "active" : ""}
            key={category.id}
            onClick={() => selectCategory(category.id)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="lesson-list">
        {visibleVideos.map((video) => (
          <button
            className={activeVideo === video.id ? "lesson-card active" : "lesson-card"}
            key={video.id}
            onClick={() => {
              setActiveVideo(video.id);
              setQuizResult(null);
            }}
            type="button"
          >
            <div>
              <strong>{video.title}</strong>
              <small>{video.description}</small>
              <i>{completedVideos.includes(video.id) ? "Listo" : "Ver"}</i>
            </div>
            <span className="lesson-preview" aria-hidden="true">
              <video muted playsInline preload="metadata" src={`${video.src}#t=0.1`} />
            </span>
          </button>
        ))}
      </div>

      <section className="video-panel">
        <div className="video-heading">
          <h2>{activeVideoData.title}</h2>
          <span>{activeVideoData.duration}</span>
        </div>
        <video
          controls
          key={activeVideoData.src}
          onEnded={() => onVideoEnded(activeVideoData.id)}
          poster="/assets/tooth-hero.png"
          src={activeVideoData.src}
        />
        <p className={completed ? "video-status done" : "video-status"}>
          {completed ? "Video completado · +25 puntos" : "Puedes responder el mini cuestionario cuando quieras."}
        </p>
      </section>

      <section className="quiz-panel">
        <h2>Mini cuestionario</h2>
        {activeVideoData.questions.map((question, questionIndex) => {
          const key = `${activeVideoData.id}-${questionIndex}`;

          return (
            <fieldset key={question.question}>
              <legend>{question.question}</legend>
              {question.options.map((option, optionIndex) => (
                <button
                  className={quizAnswers[key] === optionIndex ? "picked" : ""}
                  key={option}
                  onClick={() => {
                    selectQuizAnswer(activeVideoData.id, questionIndex, optionIndex);
                    setQuizResult(null);
                  }}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </fieldset>
          );
        })}
        {quizResult?.videoId === activeVideoData.id && (
          <p className={quizResult.complete && quizResult.correctCount === quizResult.total ? "quiz-result success" : "quiz-result"}>
            {!quizResult.complete
              ? "Responde todas las preguntas antes de validar."
              : quizResult.correctCount === quizResult.total
                ? !quizResult.awarded
                  ? "Cuestionario validado. Ya ganaste los puntos de esta guía."
                  : `¡Excelente! Ganaste ${quizResult.correctCount * 15} puntos.`
                : `Respondiste ${quizResult.correctCount} de ${quizResult.total} correctamente.`}
          </p>
        )}
        {quizResult?.videoId === activeVideoData.id && quizResult.complete && quizResult.correctCount < quizResult.total ? (
          <button className="quiz-action reset" onClick={handleResetQuiz} type="button">
            Resetear cuestionario
          </button>
        ) : (
          <button className="quiz-action" onClick={handleValidateQuiz} type="button">
            Validar respuestas
          </button>
        )}
      </section>
    </div>
  );
}

function TechniqueTestScreen({
  answers,
  recommendation,
  toggleAnswer,
  setScreen,
}: {
  answers: Record<TestKey, boolean>;
  recommendation: { title: string; body: string };
  toggleAnswer: (key: TestKey) => void;
  setScreen: (screen: Screen) => void;
}) {
  return (
    <div className="screen-content test-view">
      <header className="simple-title left">
        <h1>¿Qué técnica necesito?</h1>
        <p>Responde rápido y Ceps te orienta.</p>
      </header>

      <div className="test-list">
        {testQuestions.map((item) => (
          <button
            className={answers[item.key] ? "active" : ""}
            key={item.key}
            onClick={() => toggleAnswer(item.key)}
            type="button"
          >
            {item.question}
            <span>{answers[item.key] ? "Sí" : "No"}</span>
          </button>
        ))}
      </div>

      <section className="result-card">
        <CepsGuide message="Esta recomendación no reemplaza una evaluación dental, pero te ayuda a elegir por dónde comenzar." />
        <span>Resultado recomendado</span>
        <h2>{recommendation.title}</h2>
        <p>{recommendation.body}</p>
        <button className="primary-action" onClick={() => setScreen("interdental")} type="button">
          Practicar recomendación
        </button>
      </section>
    </div>
  );
}

function ProgressScreen({
  hygieneScore,
  state,
  level,
  setScreen,
}: {
  hygieneScore: number;
  state: StoredState;
  level: { name: string; message: string };
  setScreen: (screen: Screen) => void;
}) {
  const weeklyInterdental = state.interdentalToday ? "6 / 7 días" : "En progreso";
  const badges = state.badges.length
    ? state.badges
    : ["Primera semana", "Aprendiz de Bass", "Héroe del hilo dental"];

  return (
    <div className="screen-content progress-view">
      <header className="screen-title-row">
        <h1>Mi progreso</h1>
        <button className="calendar-button" type="button">
          Cal
        </button>
      </header>

      <section className="weekly-card">
        <div>
          <span>Nivel actual</span>
          <strong>{level.name}</strong>
          <p>{level.message}</p>
        </div>
        <div className="trophy" aria-hidden="true" />
      </section>

      <section className="summary-list">
        <h2>Resumen</h2>
        <ProgressRow label="Puntos" value={`${state.points}`} />
        <ProgressRow label="Racha" value={`${state.streak} días`} />
        <ProgressRow label="Higiene de hoy" value={`${hygieneScore}%`} />
        <ProgressRow label="Cepillados completados" value={state.brushToday ? "Completado" : "Pendiente"} />
        <ProgressRow label="Limpieza interdental semanal" value={weeklyInterdental} />
        <ProgressRow label="Videos completados" value={`${state.completedVideos.length} / ${videos.length}`} />
      </section>

      <section className="badges">
        <h2>Insignias desbloqueadas</h2>
        <div>
          {badges.map((badge) => (
            <button key={badge} onClick={() => setScreen("learn")} type="button">
              {badge}
            </button>
          ))}
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

function ProfileScreen({
  state,
  level,
  resetLocalProgress,
}: {
  state: StoredState;
  level: string;
  resetLocalProgress: () => void;
}) {
  return (
    <div className="screen-content profile-view">
      <section className="profile-card">
        <div className="tiny-tooth large" aria-hidden="true" />
        <h1>Ceps y Ana</h1>
        <p>Pequeños hábitos, grandes sonrisas.</p>
      </section>

      <div className="profile-stats">
        <span>
          <strong>{state.points}</strong>
          puntos
        </span>
        <span>
          <strong>{level}</strong>
          nivel
        </span>
      </div>

      <button className="secondary-action" onClick={resetLocalProgress} type="button">
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
    <nav className="bottom-nav" aria-label="Navegación de la app">
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

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}
