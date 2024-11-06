import { useEffect, useState } from "react";
import { ref, push, onValue } from "firebase/database";
import { database } from "./index";

export type Program = {
    nameProgram: string;
    description: string;
    workTime: number;
    rest: number;
    cycles: number;
    startDate: string | null;
    endDate: string | null;
    frequency: number;
};

const useWorkWithFireBase = () => {

 const [programs, setPrograms] = useState<Record<string, Program>>({}); // Добавляем состояние programs
 const [message, setMessage] = useState<string | null>("");

    ///сохраняем программу в firebase
  const saveProgram = (program : Program) => {
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

  ///получаем программы из firebase
  useEffect(() => {
    const sendProgramToFirebase = ref(database, "programs");
    const unsubscribe = onValue(sendProgramToFirebase, (snapshot) => {
      const programs = snapshot.val();
      setPrograms(programs); // Обновляем состояние компонента с полученными программами
    });

    return () => unsubscribe();
  }, []);

  return{
    programs,
    message,
    setMessage,
    saveProgram
  }
}

export default useWorkWithFireBase