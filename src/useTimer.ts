import { useEffect, useState } from "react";

const useTimer = (
  initialInputWorkTime: number,
  initialInputRestTime: number,
  initialInputCycles: number,
  setIsSoundIsPlaying: (isSoundIsPlaying: boolean) => void,
  setStartButtonDisabled: (startButtonDisabled: boolean) => void
) => {
  const [timer, setTimer] = useState<number>(initialInputWorkTime); //время таймера=время тренировки
  const [timerIsWorking, setTimerIsWorking] = useState<boolean>(false); //false так как таймер изначально не включен
  const [timerIsStoped, setTimerIsStoped] = useState<boolean>(false);

  const [restTimer, setRestTimer] = useState<number>(initialInputRestTime);
  const [restTimerIsWorking, setRestTimerIsWorking] = useState<boolean>(false);
  const [restTimerIsStoped, setRestTimerIsStoped] = useState<boolean>(false);

  const [cycleNumber, setCycleNumber] = useState<number>(1); //первоначвльно на 1 цикле мы находимся

  const startTimer = () => {
    setIsSoundIsPlaying(true); // gudok
    setTimer(initialInputWorkTime);
    setCycleNumber(1);
    setTimerIsWorking(true);
    setRestTimer(initialInputRestTime);
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
    setTimer(initialInputWorkTime); //таймер сбрасывается до начального значения времени для тренировки(20cek)
    setRestTimer(initialInputRestTime);
    setCycleNumber(1); // таймер сбрасывается до первого цикла

    setTimerIsStoped(false);
    setRestTimerIsStoped(false);
    setStartButtonDisabled(false);
  };

  ///ТРЕНИРОВКА
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerIsWorking && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
      setRestTimer(initialInputRestTime);
    } else if (
      timerIsWorking &&
      timer === 0 &&
      cycleNumber <= initialInputCycles
    ) {
      setIsSoundIsPlaying(true); // gudok
      setTimerIsWorking(false);
      setRestTimerIsWorking(true);
      setRestTimer(initialInputRestTime);
    }

    return () => clearInterval(interval);
  }, [
    timerIsWorking,
    timer,
    cycleNumber,
    initialInputCycles,
    initialInputRestTime,
  ]);

  ///ОТДЫХ
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (restTimerIsWorking && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prevTime) => prevTime - 1);
      }, 1000);
      setTimer(initialInputWorkTime);
    } else if (
      restTimerIsWorking &&
      restTimer === 0 &&
      cycleNumber < initialInputCycles
    ) {
      setIsSoundIsPlaying(true); // gudok
      setRestTimerIsWorking(false);
      setTimerIsWorking(true);
      setTimer(initialInputWorkTime);
      setCycleNumber((prevCycle) => prevCycle + 1);
    }

    return () => clearInterval(interval);
  }, [
    restTimerIsWorking,
    restTimer,
    cycleNumber,
    initialInputWorkTime,
    initialInputWorkTime,
  ]);

  return {
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
    setTimer,
    setRestTimer,
    setTimerIsWorking,
    setRestTimerIsWorking
  };
};

export default useTimer;
