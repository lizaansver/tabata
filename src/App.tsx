import React, { useState} from "react";
import "./App.css";
import ReactAudioPlayer from "react-audio-player";
import { Registration } from "./Registration/Registration";
import useTimer from "./useTimer";
import useWorkWithFireBase,  { Program } from "./useWorkWithFireBase"
import { Schedule } from "./Schedule/Schedule";

function App() {
  const [showModal, setshowModal] = useState<boolean>(false);

  const [inputWorkTime, setInputWorkTime] = useState<number | undefined>(20);
  const [inputRestTime, setInputRestTime] = useState<number | undefined>(10);
  const [inputCycles, setInputCycles] = useState<number | undefined>(8);

  const [inputTrainingName, setInputTrainingName] = useState<string>("Добавьте название тренировки");

  const [description, setDescription] = useState<string>("");

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null); //дата не выбрана
  const [frequency, setFrequency] = useState<number>(1);

  const [selectedProgram, setSelectedProgram] = useState(""); // Добавляем состояние selectedProgram чобы выбирать программу

  const [startButtonDisabled, setStartButtonDisabled] = useState<boolean>(false);

  const [isSoundIsPlaying, setIsSoundIsPlaying] = useState<boolean>(false);

  const {
    timer,
    timerIsWorking,
    timerIsStoped,
    restTimer,
    restTimerIsWorking,
    restTimerIsStoped,
    cycleNumber,
    startTimer,
    stopTimer,
    continueTimer,
    resetTime,
    setRestTimer,
    setTimer,
    setTimerIsWorking,
    setRestTimerIsWorking
  } = useTimer(inputWorkTime ?? 20, inputRestTime ?? 10, inputCycles ?? 8, setIsSoundIsPlaying, setStartButtonDisabled)

  const {programs, saveProgram, message, setMessage} = useWorkWithFireBase()

  const nameOnFocus = (event: { target: { value: string } }) => {
    if (event.target.value === "Добавьте название тренировки") {
      setInputTrainingName("");
    }
  };

  const nameOnBlur = (event: { target: { value: string } }) => {
    if (event.target.value === "") {
      setInputTrainingName("Добавьте название тренировки");
    }
  };

  const nameOnChange = (event: { target: { value: string } }) => {
    setInputTrainingName(event.target.value);
  };

  const descriptionOnChange = (event: { target: { value: string } }) => {
    setDescription(event.target.value);
  };

  const finallySaveProgram = () => {
    const program: Program = {
      nameProgram: inputTrainingName,
      description: description,
      workTime: inputWorkTime as number,
      rest: inputRestTime as number,
      cycles: inputCycles as number,
      startDate: startDate ? startDate.toISOString() : null, //метод toISOString() для преобразования объектов Date в строки, которые могут быть сохранены в Firebase.
      endDate: endDate ? endDate.toISOString() : null,
      frequency: frequency,
    };
    saveProgram(program);
  };
  // функция finallySaveProgram создает объект program и передает его в функцию saveProgram при нажатии на кнопку
  //Функция finallySaveProgram находится в компоненте App, 
  //потому что она зависит от множества состояний, которые находятся в этом компоненте. 
  //Если бы мы вынесли эту функцию в отдельный хук, нам пришлось бы передавать все эти состояния в хук, что могло бы сделать код более сложным и менее читаемым.
  

  const chooseSavedProgramFromFB = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProgram(e.target.value); //выбранная программа

    if (!e.target.value) {
      return;
    }

    const programFromFirebase = programs[e.target.value]; 
    setInputTrainingName(programFromFirebase.nameProgram);
    setDescription(
      programFromFirebase.description ? programFromFirebase.description : ""
    );
    setInputWorkTime(programFromFirebase.workTime);
    setInputRestTime(programFromFirebase.rest);
    setInputCycles(programFromFirebase.cycles);
    setTimer(programFromFirebase.workTime); // Обновляем значение таймера
    setRestTimer(programFromFirebase.rest); // Обновляем значение отдыха
    setStartDate(programFromFirebase.startDate ? new Date(programFromFirebase.startDate) : null); //строки дато обратно в дейт
    setEndDate(programFromFirebase.endDate ? new Date(programFromFirebase.endDate) : null);
    setFrequency(programFromFirebase.frequency);
  };

  return (
    <>
      <Registration showModal={showModal} setshowModal={setshowModal} />

      <h1>TABATA TIMER</h1>
      <h5>
        Выберите ранее сохраненную тренировку или <br />
        создайте новую вместе с расписанием и сохраните в самом низу
      </h5>

      <select
        className="selected-program"
        value={selectedProgram}
        onChange={chooseSavedProgramFromFB}
      >
        <option value="" disabled>
          Выберите ранее сохраненную тренировку
        </option>{" "}
        {/**Первый элемент выпадающего списка, который отображается по умолчанию */}
        {programs
          ? Object.entries(programs).map((
              [key, program] // Итерируемся по объекту programs, который содержит программы, полученные из базы данных
            ) => (
              <option key={key} value={key}>
                {" "}
                {/** сюда не получится value={program} ибо это целый объект */}
                {program.nameProgram}{" "}
                {/**Отображаем название программы внутри элемента <option> */}
              </option>
            ))
          : null}
      </select>
 
      <div className="content">
        <input
          type="text"
          className="training-name"
          value={inputTrainingName}
          onFocus={nameOnFocus}
          onBlur={nameOnBlur}
          onChange={nameOnChange}
        />

        <div className="trainee-descr">
          <h4>Описание тренировки</h4>
          <textarea
            className="description"
            value={description}
            onChange={descriptionOnChange}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
            spellCheck="false"
          />
        </div>

        <label>
          Тренировка (секунды):
          <input
            className="input-work"
            value={inputWorkTime}
            onChange={(e) => {
              const value = e.target.value;
              setInputWorkTime(+value || undefined);
              setTimer(+value || 0);
              setTimerIsWorking(false);
            }}
          />
        </label>

        <label>
          Отдых (секунды):
          <input
            className="input-rest"
            value={inputRestTime}
            onChange={(e) => {
              const value = e.target.value;
              setInputRestTime(+value || undefined);
              setRestTimer(+value || 0);
              setRestTimerIsWorking(false);
            }}
          />
        </label>

        <label>
          Количество подходов:
          <input
            className="input-cycle"
            value={inputCycles}
            onChange={(e) => {
              const value = e.target.value;
              setInputCycles(+value || undefined);
            }}
          />
        </label>
      </div>
      <div className="buttons">
        <button
          type="button"
          onClick={startTimer}
          disabled={startButtonDisabled}
          className="button-start"
        >
          Старт
        </button>
        <button
          type="button"
          onClick={
            timerIsStoped || restTimerIsStoped ? continueTimer : stopTimer
          }
        >
          {timerIsStoped || restTimerIsStoped ? "Далее" : "Пауза"}
        </button>

        <button type="button" onClick={resetTime}>
          Сброс
        </button>
      </div>
      <div
        className={`timer ${timerIsWorking || timerIsStoped ? "active" : ""}`}
      >
        {timerIsWorking
          ? `${Math.floor(timer / 60)
              .toString()
              .padStart(2, "0")} : ${(timer % 60).toString().padStart(2, "0")}`
          : `${Math.floor(timer / 60)
              .toString()
              .padStart(2, "0")} : ${(timer % 60).toString().padStart(2, "0")}`}
      </div>

      <div
        className={`rest-timer ${
          restTimerIsWorking || restTimerIsStoped ? "active" : ""
        }`}
      >
        {restTimerIsWorking
          ? `${Math.floor(restTimer / 60)
              .toString()
              .padStart(2, "0")} : ${(restTimer % 60)
              .toString()
              .padStart(2, "0")}`
          : `${Math.floor(restTimer / 60)
              .toString()
              .padStart(2, "0")} : ${(restTimer % 60)
              .toString()
              .padStart(2, "0")}`}
      </div>

      <div className="cycles">
        {cycleNumber} / {inputCycles} подходов
      </div>

      {isSoundIsPlaying ? (
        <ReactAudioPlayer
          src={`${process.env.PUBLIC_URL}/svistok.mp3`}
          autoPlay
          onEnded={() => setIsSoundIsPlaying(false)}
        />
      ) : null}

      <Schedule />

      <button type="button" className="save-program" onClick={finallySaveProgram}>
        Сохранить&nbsp;тренировку
      </button>

      {message ? <h4 className="message">{message}</h4> : null}
    </>
  );
}

export default App;
