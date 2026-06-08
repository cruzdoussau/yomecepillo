"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Screen = "home" | "brush" | "interdental" | "learn" | "test" | "progress" | "profile";
type InterdentalMethodId = "floss" | "picks" | "brushes";
type VideoId = "bass" | "floss" | "picks" | "interdentalBrush";
type TestKey = "bleeding" | "braces" | "wideSpaces" | "sensitivity" | "implants";

type StoredState = {
  points: number;
  streak: number;
  lastCompleted: string;
  brushToday: boolean;
  interdentalToday: boolean;
  completedVideos: VideoId[];
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
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
}> = [
  {
    id: "bass",
    title: "Técnica Bass Modificada",
    duration: "2:45 min",
    src: "/videos/bass-modificada.mp4",
    icon: "brush",
    questions: [
      {
        question: "¿Cuál es el ángulo correcto del cepillo?",
        options: ["90°", "45°", "20°"],
        correct: 1,
      },
      {
        question: "¿Qué movimiento se realiza?",
        options: ["Horizontal fuerte", "Vibratorio suave", "Circular rápido"],
        correct: 1,
      },
    ],
  },
  {
    id: "floss",
    title: "Uso de hilo dental",
    duration: "1:58 min",
    src: "/videos/hilo-dental.mp4",
    icon: "floss",
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
    title: "Uso de ganchitos de hilo dental",
    duration: "2:10 min",
    src: "/videos/ganchitos.mp4",
    icon: "pick",
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
    title: "Uso de cepillos interdentales",
    duration: "2:30 min",
    src: "/videos/cepillo-interdental.mp4",
    icon: "interdental",
    questions: [
      {
        question: "¿Cuándo ayudan más?",
        options: ["Espacios amplios", "Dientes pegados sin espacio", "Solo lengua"],
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
  brushToday: false,
  interdentalToday: false,
  completedVideos: [],
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
  const [activeVideo, setActiveVideo] = useState<VideoId>("bass");
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

  function answerQuiz(videoId: VideoId, questionIndex: number, optionIndex: number) {
    const key = `${videoId}-${questionIndex}`;
    const video = videos.find((item) => item.id === videoId);
    const alreadyAnswered = quizAnswers[key] !== undefined;

    setQuizAnswers((current) => ({ ...current, [key]: optionIndex }));

    if (!alreadyAnswered && video?.questions[questionIndex].correct === optionIndex) {
      addPoints(15);
    }
  }

  function toggleTestAnswer(key: TestKey) {
    setState((current) => ({
      ...current,
      testAnswers: { ...current.testAnswers, [key]: !current.testAnswers[key] },
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

          {screen !== "home" && (
            <button className="back-button" onClick={() => setScreen("home")} type="button">
              Atrás
            </button>
          )}

          {screen === "home" && (
            <HomeScreen
              hygieneScore={hygieneScore}
              level={level.name}
              state={state}
              setScreen={setScreen}
              completeDay={completeDay}
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
              setActiveVideo={setActiveVideo}
              activeVideoData={activeVideoData}
              completedVideos={state.completedVideos}
              onVideoEnded={completeVideo}
              quizAnswers={quizAnswers}
              answerQuiz={answerQuiz}
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
  completeDay,
}: {
  hygieneScore: number;
  level: string;
  state: StoredState;
  setScreen: (screen: Screen) => void;
  completeDay: () => void;
}) {
  return (
    <div className="screen-content home-view">
      <header className="home-top">
        <button aria-label="Menú" className="icon-button menu-icon" type="button">
          <span />
        </button>
        <Image src="/logo.png" alt="YoMeCepillo.cl" width={190} height={80} priority />
        <button aria-label="Notificaciones" className="icon-button bell-icon" type="button">
          <span />
        </button>
      </header>

      <div className="hello-block">
        <h1>¡Hola, Ana!</h1>
        <p>Ceps está listo para cuidar tu sonrisa hoy.</p>
      </div>

      <CepsGuide message="Completa cepillado y limpieza interdental para subir tu higiene diaria." />

      <section className="score-card">
        <span>Mi higiene hoy</span>
        <div className="score-circle">
          <strong>{hygieneScore}%</strong>
          <small>{hygieneScore === 100 ? "Excelente" : "Sigue"}</small>
        </div>
      </section>

      <div className="habit-shortcuts">
        <button className="mini-habit" onClick={() => setScreen("brush")} type="button">
          <span className="habit-illustration brush-small" />
          <strong>Cepillado</strong>
          <small>{state.brushToday ? "Completado" : "Pendiente"}</small>
          <i className={state.brushToday ? "check active" : "check"} />
        </button>
        <button className="mini-habit" onClick={() => setScreen("interdental")} type="button">
          <span className="habit-illustration floss-small" />
          <strong>Limpieza interdental</strong>
          <small>{state.interdentalToday ? "Completada" : "Pendiente"}</small>
          <i className={state.interdentalToday ? "check active" : "check"} />
        </button>
      </div>

      <section className="streak-panel">
        <div>
          <span>Racha diaria</span>
          <strong>{state.streak} días</strong>
          <p>Nivel actual: {level}</p>
        </div>
        <div className="tiny-tooth" aria-hidden="true" />
      </section>

      <section className="tip-card">
        <span className="tip-icon" aria-hidden="true" />
        <div>
          <strong>Consejo del día</strong>
          <p>La limpieza interdental ayuda a remover placa donde el cepillo no llega.</p>
        </div>
      </section>

      <div className="home-actions">
        <button className="primary-action" onClick={() => setScreen("brush")} type="button">
          Comenzar cepillado
        </button>
        <button className="secondary-action" onClick={() => setScreen("interdental")} type="button">
          Registrar limpieza interdental
        </button>
        <button
          className="ghost-action"
          disabled={!state.brushToday || !state.interdentalToday || state.lastCompleted === todayKey()}
          onClick={completeDay}
          type="button"
        >
          Cerrar día y sumar racha
        </button>
      </div>
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
  activeVideoData,
  completedVideos,
  quizAnswers,
  setActiveVideo,
  onVideoEnded,
  answerQuiz,
}: {
  activeVideo: VideoId;
  activeVideoData: (typeof videos)[number];
  completedVideos: VideoId[];
  quizAnswers: Record<string, number>;
  setActiveVideo: (video: VideoId) => void;
  onVideoEnded: (video: VideoId) => void;
  answerQuiz: (video: VideoId, questionIndex: number, optionIndex: number) => void;
}) {
  const completed = completedVideos.includes(activeVideo);

  return (
    <div className="screen-content learn-view">
      <header className="simple-title">
        <h1>Aprende con videos</h1>
        <p>Cuida tu boca con explicaciones simples.</p>
      </header>

      <div className="lesson-list">
        {videos.map((video) => (
          <button
            className={activeVideo === video.id ? "lesson-card active" : "lesson-card"}
            key={video.id}
            onClick={() => setActiveVideo(video.id)}
            type="button"
          >
            <span className={`lesson-icon ${video.icon}`} aria-hidden="true" />
            <div>
              <strong>{video.title}</strong>
              <small>{video.duration}</small>
            </div>
            <i>{completedVideos.includes(video.id) ? "Listo" : "Ver"}</i>
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
          onEnded={() => onVideoEnded(activeVideoData.id)}
          poster="/assets/tooth-hero.png"
          src={activeVideoData.src}
        />
        <p className={completed ? "video-status done" : "video-status"}>
          {completed ? "Video completado · +25 puntos" : "Al terminar se activará el mini cuestionario."}
        </p>
      </section>

      {completed && (
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
                    onClick={() => answerQuiz(activeVideoData.id, questionIndex, optionIndex)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </fieldset>
            );
          })}
        </section>
      )}
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
