import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import ReactAudioPlayer from "react-audio-player";
import { ref, push, onValue } from "firebase/database";
import { database } from "./index";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function App() {
  const [inputWorkTime, setInputWorkTime] = useState<number | string>(20);
  const [inputRestTime, setInputRestTime] = useState<number | string>(10);
  const [inputCycles, setInputCycles] = useState<number | string>(8);
  const [inputTrainingName, setInputTrainingName] = useState<string>(
    "Название тренировки"
  );
  const [message, setMessage] = useState<string | null>("");
  const [selectedDate,setSelectedDate] = useState(new Date())
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null); //дата не выбрана
  //Использование типа null | Date вместо undefined | Date позволяет нам указать, 
  //что состояние endDate может быть не выбрано (null), а не просто не определено (undefined). 
  //Это может быть полезно, например, если мы хотим отличать случай, когда пользователь еще 
  //не выбрал конечную дату, от случая, когда пользователь явно указал, что конечная дата не выбрана.

  const [frequency, setFrequency] = useState<number>(1);

  const [programs, setPrograms] = useState<Record<string, Program>>({}); // Добавляем состояние programs
  const [selectedProgram, setSelectedProgram] = useState(""); // Добавляем состояние selectedProgram чобы выбирать программу

  const [timer, setTimer] = useState<number>(inputWorkTime as number); //время таймера=время тренировки
  const [timerIsWorking, setTimerIsWorking] = useState<boolean>(false); //false так как таймер изначально не включен
  const [timerIsStoped, setTimerIsStoped] = useState<boolean>(false);

  const [restTimer, setRestTimer] = useState<number>(inputRestTime as number);
  const [restTimerIsWorking, setRestTimerIsWorking] = useState<boolean>(false);
  const [restTimerIsStoped, setRestTimerIsStoped] = useState<boolean>(false);

  const [cycleNumber, setCycleNumber] = useState<number>(1); //первоначвльно на 1 цикле мы находимся
  const [isSoundIsPlaying, setIsSoundIsPlaying] = useState<boolean>(false);

  const makeSchedule = (startDate:Date, endDate:Date, frequency:number) => {
    const schedule = []
    const currentDate = startDate

    while(currentDate <= endDate){
      schedule.push(new Date(currentDate)) //это добавление текущей даты (currentDate) в массив schedule. Мы создаем новый объект Date, чтобы избежать изменения исходного объекта currentDate.
      currentDate.setDate(currentDate.getDate() + frequency) //это увеличение текущей даты (currentDate) на значение frequency. Мы используем метод setDate() объекта Date, чтобы изменить день месяца, и метод getDate(), чтобы получить текущий день месяца.//чтобы изменить день месяца в исходном объекте Date, мы должны использовать метод setDate(), а не присваивание нового значения переменной currentDate!! 
    }

    return schedule
    //Эта функция генерирует массив дат, начиная с startDate и заканчивая endDate, с шагом frequency. 
    //Например, если startDate равно 2022-01-01, endDate равно 2022-01-10 и frequency равно 2, 
    //то функция вернет массив [2022-01-01, 2022-01-03, 2022-01-05, 2022-01-07, 2022-01-09].
  }

  //useEffect - это хук React, который позволяет выполнять побочные эффекты в функциональных
  //компонентах. В данном случае, useEffect используется для запуска и остановки таймера
  //в зависимости от значений isWorking и timer.

  //Параметры useEffect
  //Функция эффекта: Это функция, которая будет выполнена после каждого рендера компонента,
  //если зависимости (второй параметр) изменились.

  ///ТРЕНИРОВКА
  useEffect(() => {
    let interval: NodeJS.Timeout; //Переменная interval объявляется в начале функции эффекта, чтобы она была доступна для очистки.

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
    if (event.target.value === "Название тренировки") {
      setInputTrainingName("");
    }
  };

  const nameOnBlur = (event: { target: { value: string } }) => {
    if (event.target.value === "") {
      setInputTrainingName("Название тренировки");
    }
  };

  const nameOnChange = (event: { target: { value: string } }) => {
    setInputTrainingName(event.target.value);
  };

  const startTimer = () => {
    setIsSoundIsPlaying(true); // gudok
    setTimer(inputWorkTime as number);
    setCycleNumber(1);
    setTimerIsWorking(true);
    setRestTimer(inputRestTime as number);
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
  };


  ///сохраняем программу в firebase
  const saveProgram = () => {
    const program = {
      nameProgram: inputTrainingName,
      workTime: inputWorkTime,
      rest: inputRestTime,
      cycles: inputCycles,
    };

    const sendProgramToFirebase = ref(database, "programs");
    push(sendProgramToFirebase, program) //push метод firebase
      .then(() => {
        console.log("программа сохранена");
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
    workTime: number;
    rest: number;
    cycles: number;
  };

  /**
   * В строке const sendProgramToFirebase = ref(database, 'programs'); мы создаем ссылку на узел programs
   * в базе данных Firebase Realtime Database. Узел programs будет содержать все программы,
   * которые мы сохраняем в базу данных.
   *
   * Когда мы сохраняем программу в базу данных, мы используем метод push(),
   * который добавляет новый узел в указанный узел базы данных и возвращает ссылку на этот узел.
   * Мы передаем ему ссылку на узел programs и объект program, содержащий данные о программе
   * тренировки.
   *
   * В контексте базы данных, узел (node) - это элемент данных,
   * который может содержать другие узлы или значения.
   * Узлы используются для структурирования данных в иерархическую древовидную структуру.
   */


  ///получаем программы из firebase
  useEffect(() => {
    const sendProgramToFirebase = ref(database, "programs");
    const unsubscribe = onValue(sendProgramToFirebase, (snapshot) => {
      const programs = snapshot.val();
      setPrograms(programs); // Обновляем состояние компонента с полученными программами
    });

    return () => unsubscribe(); // Отменяем подписку на изменения в узле при размонтировании компонента
  }, []);

  //Когда вы подписываетесь на изменения в узле программ в базе данных с помощью метода onValue,
  //вы получаете объект snapshot, который содержит текущее значение данных в узле программ.!!

  //Чтобы получить данные из объекта snapshot, вы можете использовать метод val(),
  //который возвращает значение данных в виде обычного JavaScript-объекта.
  // В вашем случае, snapshot.val() вернет объект, содержащий все программы,
  //которые были сохранены в базе данных.

  //Затем вы можете обработать полученные программы и обновить состояние
  //вашего приложения в соответствии с этими данными.
  //Например, вы можете сохранить программы в состоянии компонента и отобразить их в пользовательском интерфейсе, позволяя пользователям выбирать программу для тренировк(это далее)

  return (
    <>
      <h1>TABATA TIMER</h1>
      <div className="content">
        <select
          className="selected-program"
          value={selectedProgram}
          onChange={(e) => {
            setSelectedProgram(e.target.value); //выбранная программа

            if (e.target.value) {
              const programFromFirebase = programs[e.target.value];
              setInputTrainingName(programFromFirebase.nameProgram);
              setInputWorkTime(programFromFirebase.workTime);
              setInputRestTime(programFromFirebase.rest);
              setInputCycles(programFromFirebase.cycles);
              setTimer(programFromFirebase.workTime); // Обновляем значение таймера
              setRestTimer(programFromFirebase.rest); // Обновляем значение отдыха
            }
          }}
        >
          <option value="">Выберите сохраненную программу</option>{" "}
          {/**Первый элемент выпадающего списка, который отображается по умолчанию */}
          {Object.entries(programs).map((
            [key, program] // Итерируемся по объекту programs, который содержит программы, полученные из базы данных
          ) => (
            <option key={key} value={key}>
              {" "}
              {/** сюда не получится value={program} ибо это целый объект */}
              {(program as { nameProgram: string }).nameProgram}{" "}
              {/**Отображаем название программы внутри элемента <option> */}
            </option>
          ))}
        </select>

        {/**время тренировочки */}
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date || new Date())}
          selectsStart
          startDate={startDate ? startDate : undefined}
          endDate={endDate ? endDate : undefined} //при передаче значения endDate в свойство endDate компонента DatePicker, мы все равно должны проверять, является ли значение endDate равным null, и если это так, передавать undefined вместо null. Это связано с тем, что свойство endDate компонента DatePicker ожидает значение типа Date | undefined, а не Date | null
          dateFormat="dd/MM/yyyy"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate ? startDate : undefined}
          endDate={endDate ? endDate : undefined}
          dateFormat="dd/MM/yyyy"
        />

        <select value={frequency} onChange={(e) => setFrequency(+e.target.value)}>
        <option value={1}>Каждый день</option>
        <option value={2}>Каждые 2 дня</option>
        <option value={3}>Каждые 3 дня</option>
        </select>
        
        <ul>
          {endDate ? makeSchedule(startDate || new Date(), endDate, frequency).map((date) => (
            <li key={date.toDateString()}>{date.toLocaleDateString()}</li>
          )) : null}
        </ul>

        <input
          type="text"
          className="training-name"
          value={inputTrainingName}
          onFocus={nameOnFocus}
          onBlur={nameOnBlur}
          onChange={nameOnChange}
        />
        <label>
          Тренировка (секунды):
          <input
            type="number"
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
            type="number"
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
            type="number"
            value={inputCycles}
            onChange={(e) =>
              setInputCycles(e.target.value === "" ? "" : +e.target.value)
            }
          />
        </label>
      </div>
      <div className="buttons">
        <button type="button" onClick={startTimer}>
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
      <div className="timer">
        {timerIsWorking
          ? `${Math.floor(timer / 60)
              .toString()
              .padStart(2, "0")} : ${(timer % 60).toString().padStart(2, "0")}`
          : `${Math.floor(timer / 60)
              .toString()
              .padStart(2, "0")} : ${(timer % 60)
              .toString()
              .padStart(2, "0")} треня`}
      </div>

      <div className="rest-timer">
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
              .padStart(2, "0")} отдых`}
      </div>

      <div className="cycles">
        {cycleNumber} / {inputCycles} подходов
      </div>

      {isSoundIsPlaying ? (
        <ReactAudioPlayer
          src="/svistok.mp3"
          autoPlay
          onEnded={() => setIsSoundIsPlaying(false)}
        />
      ) : null}

      <button type="button" className="save-program" onClick={saveProgram}>
        Сохранить тренировку
      </button>

      {message ? <h4 className="message">{message}</h4> : null}
    </>
  );
}

export default App;
