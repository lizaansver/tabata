import React, { useState, useRef, useEffect } from "react";
import "./App.css";

import ReactAudioPlayer from "react-audio-player";

function App() {
  const [inputWorkTime, setInputWorkTime] = useState<number | string>(20);
  const [inputRestTime, setInputRestTime] = useState<number | string>(10);
  const [inputCycles, setInputCycles] = useState<number | string>(8);

  const [timer, setTimer] = useState<number>(inputWorkTime as number); //время таймера=время тренировки
  const [timerIsWorking, setTimerIsWorking] = useState<boolean>(false); //false так как таймер изначально не включен
  const [timerIsStoped, setTimerIsStoped] = useState<boolean>(false);

  const [restTimer, setRestTimer] = useState<number>(inputRestTime as number);
  const [restTimerIsWorking, setRestTimerIsWorking] = useState<boolean>(false);
  const [restTimerIsStoped, setRestTimerIsStoped] = useState<boolean>(false);

  const [cycleNumber, setCycleNumber] = useState<number>(1); //первоначвльно на 1 цикле мы находимся
  const [isSoundIsPlaying, setIsSoundIsPlaying] = useState<boolean>(false)
  

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
      setIsSoundIsPlaying(true) // gudok
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
      setIsSoundIsPlaying(true) // gudok
      setRestTimerIsWorking(false);
      setTimerIsWorking(true);
      setTimer(inputWorkTime as number);
      setCycleNumber((prevCycle) => prevCycle + 1);
    }

    return () => clearInterval(interval);
  }, [restTimerIsWorking, restTimer, cycleNumber, inputCycles, inputWorkTime]);

  const startTimer = () => {
    setIsSoundIsPlaying(true) // gudok
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

  return (
    <>
      <h1>TABATA TIMER</h1>
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
        <button
          type="button"
          id="pauseContinue"
          onClick={
            timerIsStoped || restTimerIsStoped ? continueTimer : stopTimer
          }
        >
          {timerIsStoped || restTimerIsStoped ? "Далее" : "Пауза"}
        </button>

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
              .padStart(2, "0")} треня`}
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
              .padStart(2, "0")} отдых`}
      </div>

      <div id="cycles" className="cycles">
        {cycleNumber} / {inputCycles} подходов
      </div>

   {isSoundIsPlaying ? <ReactAudioPlayer src="/svistok.mp3" autoPlay onEnded={() => setIsSoundIsPlaying(false)}  /> : null}
    </>
  );
}

export default App;
