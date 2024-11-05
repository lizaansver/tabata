import React, { useState } from "react";
import "./Registration.css";
import {createUserWithEmailAndPassword} from "firebase/auth";
import { auth } from "../index"; // импортируем объект auth из файла index.tsx

interface RegistrationProps {
  showModal: boolean;
  setshowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Registration: React.FC<RegistrationProps> = ({
  showModal,
  setshowModal,
}) => {
  const [warning, setWarning] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const register = async (email: string, password: string) => {
    try {
      const userObject = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      ); // получаем объект
      const user = userObject.user;
      console.log("Регистрация прошла успешно", user);
    } catch (error) {
      console.error("Ошибка регистрации", error);
    }
  };

  const openshowModal = () => {
    setshowModal(true);
  };

  const closeshowModal = () => {
    setshowModal(false);
    setWarning("");
    setMessage("");
  };

  const passwordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const makeRegistrationOnFirebase = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault(); // Таким образом, event.preventDefault() используется для предотвращения поведения по умолчанию браузера при отправке формы и позволяет нам обрабатывать данные формы в JavaScript. ЧТОБЫ НЕ ОБНОВЛЯЛАСЬ СТРАНИЦА В НАШЕМ СЛУЧАЕ
    const necessaryPassword = /^(?=.*\d)[a-zA-Z]{6}/;

    if (!password.match(necessaryPassword)) {
      setWarning("Должно быть как минимум 6 латиниц и одна цифра!");
      return; // дальше не будет выполняться функция (до этого было if else с try catch ниже)
    }

    try {
      await register(email, password);
      setMessage("Вы успешно зарегистрировались!");
      setWarning("");
      // Очищаем поля ввода
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Ошибка регистрации", error);
    }
  };

  return (
    <>
      <button className="registration-button" onClick={openshowModal}>
        Регистрация
      </button>
      {showModal ? (
        <div className="modal active">
          <form
            className="registration-form"
            onSubmit={makeRegistrationOnFirebase}
          >
            <div className="cross" onClick={closeshowModal}>
              Х
            </div>
            Почта{" "}
            <input
              value={email}
              type="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            Пароль{" "}
            <input
              value={password}
              type={showPassword ? "text" : "password"}
              name="password"
              className="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <img
              className="eye"
              src={`${process.env.PUBLIC_URL}/${
                showPassword ? "opened_eye.png" : "closed_eye.png"
              }`}
              alt={showPassword ? "Показать пароль" : "Скрыть пароль"}
              onClick={passwordVisibility}
            />
            <button type="submit">Зарегистрироваться</button>
            {warning ? <h6>{warning}</h6> : null}
            {message ? <div className="message">{message}</div> : null}
          </form>
        </div>
      ) : null}
    </>
  );
};
