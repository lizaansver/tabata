import React, { useState, useEffect, useSyncExternalStore } from "react";
import "./App.css";
import ReactAudioPlayer from "react-audio-player";
import { ref, push, onValue } from "firebase/database";
import { database } from "./index";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Registration } from "./Registration/Registration";
import { newDate } from "react-datepicker/dist/date_utils";

function App() {
  const [registrationModal, setRegistrationModal] = useState<boolean>(false);

  const [inputWorkTime, setInputWorkTime] = useState<number | string>(20);
  const [inputRestTime, setInputRestTime] = useState<number | string>(10);
  const [inputCycles, setInputCycles] = useState<number | string>(8);
  const [inputTrainingName, setInputTrainingName] = useState<string>(
    "Добавьте название тренировки"
  );
  const [description, setDescription] = useState<string>("");

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null); //дата не выбрана
  const [frequency, setFrequency] = useState<number>(1);

  const [programs, setPrograms] = useState<Record<string, Program>>({}); // Добавляем состояние programs
  const [selectedProgram, setSelectedProgram] = useState(""); // Добавляем состояние selectedProgram чобы выбирать программу

  const [startButtonDisabled, setStartButtonDisabled] = useState<boolean>(
    false
  );
  const [timer, setTimer] = useState<number>(inputWorkTime as number); //время таймера=время тренировки
  const [timerIsWorking, setTimerIsWorking] = useState<boolean>(false); //false так как таймер изначально не включен
  const [timerIsStoped, setTimerIsStoped] = useState<boolean>(false);

  const [restTimer, setRestTimer] = useState<number>(inputRestTime as number);
  const [restTimerIsWorking, setRestTimerIsWorking] = useState<boolean>(false);
  const [restTimerIsStoped, setRestTimerIsStoped] = useState<boolean>(false);

  const [cycleNumber, setCycleNumber] = useState<number>(1); //первоначвльно на 1 цикле мы находимся

  const [message, setMessage] = useState<string | null>("");

  const [isSoundIsPlaying, setIsSoundIsPlaying] = useState<boolean>(false);

  const [visibleDates, setVisibleDates] = useState<number>(6); // минимум 6 дат в расписании показывает

  const makeSchedule = (startDate: Date, endDate: Date, frequency: number) => {
    const schedule = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      schedule.push(new Date(currentDate)); //это добавление текущей даты (currentDate) в массив schedule. Мы создаем новый объект Date, чтобы избежать изменения исходного объекта currentDate.
      currentDate.setDate(currentDate.getDate() + frequency);
    }
    return schedule;
  };

  ///ТРЕНИРОВКА
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerIsWorking && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
      setRestTimer(inputRestTime as number);
    } else if (
      timerIsWorking &&
      timer === 0 &&
      cycleNumber <= (inputCycles as number)
    ) {
      setIsSoundIsPlaying(true); // gudok
      setTimerIsWorking(false);
      setRestTimerIsWorking(true);
      setRestTimer(inputRestTime as number);
    }

    return () => clearInterval(interval);
  }, [timerIsWorking, timer, cycleNumber, inputCycles, inputRestTime]);

  ///ОТДЫХ
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (restTimerIsWorking && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prevTime) => prevTime - 1);
      }, 1000);
      setTimer(inputWorkTime as number);
    } else if (
      restTimerIsWorking &&
      restTimer === 0 &&
      cycleNumber < (inputCycles as number)
    ) {
      setIsSoundIsPlaying(true); // gudok
      setRestTimerIsWorking(false);
      setTimerIsWorking(true);
      setTimer(inputWorkTime as number);
      setCycleNumber((prevCycle) => prevCycle + 1);
    }

    return () => clearInterval(interval);
  }, [restTimerIsWorking, restTimer, cycleNumber, inputCycles, inputWorkTime]);

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

  const startTimer = () => {
    setIsSoundIsPlaying(true); // gudok
    setTimer(inputWorkTime as number);
    setCycleNumber(1);
    setTimerIsWorking(true);
    setRestTimer(inputRestTime as number);
    setStartButtonDisabled(true);
  };

  const stopTimer = () => {
    if (timerIsWorking) {
      setTimerIsWorking(false);
      setTimerIsStoped(true);
    } else if (restTimerIsWorking) {
      setRestTimerIsWorking(false);
      setRestTimerIsStoped(true);
    }
  };

  const continueTimer = () => {
    if (timerIsStoped) {
      setTimerIsStoped(false);
      setTimerIsWorking(true);
    } else if (restTimerIsStoped) {
      setRestTimerIsStoped(false);
      setRestTimerIsWorking(true);
    }
  };

  const resetTime = () => {
    setTimerIsWorking(false);
    setRestTimerIsWorking(false);
    setTimer(inputWorkTime as number); //таймер сбрасывается до начального значения времени для тренировки(20cek)
    setRestTimer(inputRestTime as number);
    setCycleNumber(1); // таймер сбрасывается до первого цикла

    setTimerIsStoped(false);
    setRestTimerIsStoped(false);
    setStartButtonDisabled(false);
  };

  ///сохраняем программу в firebase
  const saveProgram = () => {
    const program = {
      nameProgram: inputTrainingName,
      description: description,
      workTime: inputWorkTime,
      rest: inputRestTime,
      cycles: inputCycles,
      startDate: startDate ? startDate.toISOString() : null, //метод toISOString() для преобразования объектов Date в строки, которые могут быть сохранены в Firebase.
      endDate: endDate ? endDate.toISOString() : null,
      frequency: frequency,
    };

    const sendProgramToFirebase = ref(database, "programs");
    push(sendProgramToFirebase, program) //push метод firebase
      .then(() => {
        setMessage("Программа сохранена");
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      })
      .catch((error) => {
        console.error("не получилось", error);
      });
  };

  type Program = {
    nameProgram: string;
    description: string;
    workTime: number;
    rest: number;
    cycles: number;
    startDate: string | null;
    endDate: string | null;
    frequency: number;
  };

  ///получаем программы из firebase
  useEffect(() => {
    const sendProgramToFirebase = ref(database, "programs");
    const unsubscribe = onValue(sendProgramToFirebase, (snapshot) => {
      const programs = snapshot.val();
      setPrograms(programs); // Обновляем состояние компонента с полученными программами
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Registration
        registrationModal={registrationModal}
        setRegistrationModal={setRegistrationModal}
      ></Registration>

      <h1>TABATA TIMER</h1>
      <h5>
        Выберите ранее сохраненную тренировку или <br />
        создайте новую вместе с расписанием и сохраните в самом низу
      </h5>

      <select
        className="selected-program"
        value={selectedProgram}
        onChange={(e) => {
          setSelectedProgram(e.target.value); //выбранная программа

          if (e.target.value) {
            const programFromFirebase = programs[e.target.value];
            setInputTrainingName(programFromFirebase.nameProgram);
            setDescription(
              programFromFirebase.description
                ? programFromFirebase.description
                : ""
            );
            setInputWorkTime(programFromFirebase.workTime);
            setInputRestTime(programFromFirebase.rest);
            setInputCycles(programFromFirebase.cycles);
            setTimer(programFromFirebase.workTime); // Обновляем значение таймера
            setRestTimer(programFromFirebase.rest); // Обновляем значение отдыха
            setStartDate(
              programFromFirebase.startDate
                ? new Date(programFromFirebase.startDate)
                : null
            ); //строки дато обратно в дейт
            setEndDate(
              programFromFirebase.endDate
                ? new Date(programFromFirebase.endDate)
                : null
            );
            setFrequency(programFromFirebase.frequency);
          }
        }}
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
                {(program as { nameProgram: string }).nameProgram}{" "}
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
              setInputWorkTime(value === "" ? "" : +value);
              setTimer(value === "" ? 0 : +value);
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
              setInputRestTime(value === "" ? "" : +value);
              setRestTimer(value === "" ? 0 : +value);
              setRestTimerIsWorking(false);
            }}
          />
        </label>

        <label>
          Количество подходов:
          <input
            className="input-cycle"
            value={inputCycles}
            onChange={(e) =>
              setInputCycles(e.target.value === "" ? "" : +e.target.value)
            }
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

      <div className="schedule">
        <h3>Расписание</h3>
        Начало{" "}
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date || new Date())}
          startDate={startDate ? startDate : undefined}
          minDate={new Date()}
          endDate={endDate ? endDate : undefined} //при передаче значения endDate в свойство endDate компонента DatePicker, мы все равно должны проверять, является ли значение endDate равным null, и если это так, передавать undefined вместо null. Это связано с тем, что свойство endDate компонента DatePicker ожидает значение типа Date | undefined, а не Date | null
          dateFormat="dd/MM/yyyy"
        />
        Конец{" "}
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          startDate={startDate ? startDate : undefined}
          endDate={endDate ? endDate : undefined}
          minDate={startDate || new Date()} // Ограничиваем выбор даты
          maxDate={new Date(new Date(startDate || new Date()).setMonth((startDate || new Date()).getMonth() + 6))} // Ограничиваем выбор даты на 6 месяцев вперед
          dateFormat="dd/MM/yyyy"
        />
        <select
          className="selected-period"
          value={frequency}
          onChange={(e) => setFrequency(+e.target.value)}
        >
          <option value={1}>Каждый день</option>
          <option value={2}>Каждые 2 дня</option>
          <option value={3}>Каждые 3 дня</option>
          <option value={4}>Каждые 4 дня</option>
          <option value={5}>Каждые 5 дней</option>
          <option value={6}>Каждые 6 дней</option>
          <option value={7}>Каждую неделю</option>
        </select>
        <ul>
          {endDate
            ? makeSchedule(startDate || new Date(), endDate, frequency)
                .slice(0, visibleDates)
                .map((date) => (
                  <li key={date.toDateString()}>{date.toLocaleDateString()}</li>
                ))
            : null}
          {endDate &&
          makeSchedule(startDate || new Date(), endDate, frequency).length >
            visibleDates ? (
            <button
              className="show-more"
              onClick={() => setVisibleDates((prev) => prev + 6)}
            >
              Показать еще
            </button>
          ) : null}
        </ul>
      </div>

      <button type="button" className="save-program" onClick={saveProgram}>
        Сохранить&nbsp;тренировку
      </button>

      {message ? <h4 className="message">{message}</h4> : null}
    </>
  );
}

export default App;
