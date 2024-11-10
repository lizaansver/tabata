import { Dispatch, SetStateAction, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Schedule.css";

interface ScheduleProps {
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  setEndDate: Dispatch<SetStateAction<Date | null>>;
  setFrequency: Dispatch<SetStateAction<number>>;
  startDate: Date | null;
  endDate: Date | null;
  frequency: number;
}

export const Schedule: React.FC<ScheduleProps> = ({ setStartDate, setEndDate, setFrequency, startDate, endDate, frequency}) => {

  const [visibleDates, setVisibleDates] = useState<number>(6); // минимум 6 дат в расписании показывает

  const makeSchedule = (startDate: Date, endDate: Date, frequency: number) => {
    const schedule = [];
    const currentDate = new Date(startDate); //Создаем новый объект Date на основе startDate. Это позволяет избежать изменения исходного объекта startDate

    while (currentDate <= endDate) {
      schedule.push(new Date(currentDate)); //это добавление текущей даты (currentDate) в массив schedule. Мы создаем новый объект Date, чтобы избежать изменения исходного объекта currentDate.
      currentDate.setDate(currentDate.getDate() + frequency); //// увеличиваем текущую дату на интервал frequency
      //Метод setDate устанавливает новый день месяца для объекта currentDate, увеличивая текущий день на значение frequency.
    }

    // Добавляем endDate в массив расписания
    if (!schedule.some((date) => date.toDateString() === endDate.toDateString())) {
      schedule.push(new Date(endDate));
    }
    return schedule;
  };

 

  return (
    <div className="schedule">
      <h3>Расписание</h3>
      Начало{" "}
      <DatePicker
        selected={startDate}
        // onChange={(date) => setStartDate(date || new Date())}
        onChange={(date) => {
          setStartDate(date || new Date());
        }}
        startDate={startDate ? startDate : undefined}
        minDate={new Date()}
        endDate={endDate ? endDate : undefined} //при передаче значения endDate в свойство endDate компонента DatePicker, мы все равно должны проверять, является ли значение endDate равным null, и если это так, передавать undefined вместо null. Это связано с тем, что свойство endDate компонента DatePicker ожидает значение типа Date | undefined, а не Date | null
        dateFormat="dd/MM/yyyy"
      />
      Конец{" "}
      <DatePicker
        selected={endDate}
        onChange={(date) => {
          setEndDate(date);
        }}
        startDate={startDate ? startDate : undefined}
        endDate={endDate ? endDate : undefined}
        minDate={startDate || new Date()} // Ограничиваем выбор даты
        maxDate={
          new Date(
            new Date(startDate || new Date()).setMonth(
              (startDate || new Date()).getMonth() + 6
            )
          )
        } // Ограничиваем выбор даты на 6 месяцев вперед
        dateFormat="dd/MM/yyyy"
      />
      <select
        className="selected-period"
        value={frequency}
        onChange={(e) => {
          setFrequency(+e.target.value);
        }}
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
  );
};
