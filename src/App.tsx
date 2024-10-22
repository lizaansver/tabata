import React, { useState, useRef, useEffect } from "react";
import "./App.css";
// import { NodeJS } from "node";
// import { setInterval } from "timers";

function App() {
  const [inputWorkTime, setInputWorkTime] = useState<number | string>(20);
  const [inputRestTime, setInputRestTime] = useState<number | string>(10);
  const [inputCycles, setInputCycles] = useState<number | string>(8);

  const [timer, setTimer] = useState<number>(inputWorkTime as number); //время таймера=время тренировки
  const [timerIsWorking, setTimerIsWorking] = useState<boolean>(false); //false так как таймер изначально не включен

  const [restTimer, setRestTimer] = useState<number>(inputRestTime as number);
  const [restTimerIsWorking, setRestTimerIsWorking] = useState<boolean>(false);

  const [timerIsStoped, setTimerIsStoped] = useState<boolean>(false);
  

  const [cycleNumber, setCycleNumber] = useState<number>(1); //первоначвльно на 1 цикле мы находимся
  const audio = useRef<HTMLAudioElement>(null); // пока что null ибо нет никакой ссылки
  

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
      audio.current?.play(); //Проигрывается звуковой сигнал.
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
      audio.current?.play(); //Проигрывается звуковой сигнал.
      setRestTimerIsWorking(false);
      setTimerIsWorking(true);
      setTimer(inputWorkTime as number);
      setCycleNumber((prevCycle) => prevCycle + 1);
    }

    return () => clearInterval(interval);
  }, [restTimerIsWorking, restTimer, cycleNumber, inputCycles, inputWorkTime]);

  const startTimer = () => {
    setTimer(inputWorkTime as number);
    setCycleNumber(1);
    setTimerIsWorking(true);
    setRestTimer(inputRestTime as number);
  };

  const stopTimer = () => {
    setTimerIsWorking(false);
    setRestTimerIsWorking(false);
    setTimerIsStoped(true);
  };

  const continueTimer = () => {
    setTimerIsStoped(false);
    setTimerIsWorking(true);
    // setRestTimerIsWorking(true) НЕТ Я НЕ МОГУ ЭТО ВПИСАТЬ ПОТОМУ ЧТО ВСЕ ПОЛЕТИТ
  };

  const resetTime = () => {
    setTimerIsWorking(false);
    setRestTimerIsWorking(false);
    setTimer(inputWorkTime as number); //таймер сбрасывается до начального значения времени для тренировки(20cek)
    setRestTimer(inputRestTime as number);
    setCycleNumber(1); // таймер сбрасывается до первого цикла
  };

  return (
    <>
      <h1>Tabata Timer</h1>
      <div className="content">
        <label>
          Тренировка (секунды) :
          <input
            type="number"
            id="workTime"
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
          Отдых (секунды) :
          <input
            type="number"
            id="restTime"
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
          Количество подходов (циклов) :
          <input
            type="number"
            id="cycles"
            value={inputCycles}
            onChange={(e) =>
              setInputCycles(e.target.value === "" ? "" : +e.target.value)
            }
          />
        </label>
      </div>
      <div className="buttons">
        <button type="button" id="start" onClick={startTimer}>
          Старт
        </button>
        <button type="button" id="stop" onClick={stopTimer}>
          Пауза
        </button>
        {timerIsStoped ? (
          <button type="button" id="continue" onClick={continueTimer}>
          Далее
        </button>
        ) : null}
        <button type="button" id="reset" onClick={resetTime}>
          Сброс
        </button>
      </div>
      <div id="timer" className="timer">
        {timerIsWorking
          ? `${Math.floor(timer / 60)
              .toString()
              .padStart(2, "0")} : ${(timer % 60).toString().padStart(2, "0")}`
          : `${Math.floor(timer / 60)
              .toString()
              .padStart(2, "0")} : ${(timer % 60)
              .toString()
              .padStart(2, "0")} work`}
      </div>

      <div id="rest-timer" className="rest-timer">
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
              .padStart(2, "0")} rest`}
      </div>

      <div id="cycles" className="cycles">
        {cycleNumber} / {inputCycles} подходов
      </div>
      {/**
       * Оператор / для минут
       * Оператор / используется для деления числа на другое число.
       * В данном случае, timer / 60 делит общее количество секунд (timer) на 60,
       * чтобы получить количество полных минут.
       *
       * Оператор % для секунд
       * Оператор % используется для вычисления остатка (ОЧЕНЬ ВАЖНО) от деления одного числа на другое.
       * В данном случае, timer % 60 вычисляет остаток от деления общего количества секунд (timer)
       * на 60, чтобы получить количество секунд, которые остаются после вычисления полных минут.
       */}

      <audio id="beep" src="beep.mp3"></audio>
    </>
  );
}

export default App;
