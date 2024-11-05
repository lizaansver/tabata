import { useState } from "react";
import "./Registration.css";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../index"; // импортируем объект auth из файла index.tsx

interface RegistrationProps {
  registrationModal: boolean;
  setRegistrationModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Registration: React.FC<RegistrationProps> = ({
  registrationModal,
  setRegistrationModal,
}) => {
  const [warning, setWarning] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

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

  const openRegistrationModal = () => {
    setRegistrationModal(true);
  };

  const closeRegistrationModal = () => {
    setRegistrationModal(false);
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
    const emailInput = event.currentTarget.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = event.currentTarget.querySelector('input[name="password"]') as HTMLInputElement;
    const email = emailInput.value;
    const password = passwordInput.value;
    const necessaryPassword = /^(?=.*\d)[a-zA-Z]{6}/;

    if (!password.match(necessaryPassword)) {
      setWarning("Должно быть как минимум 6 латиниц и одна цифра!");
      return // дальше не будет выполняться функция (до этого было if else с try catch ниже)
    } 

    try {
        await register(email, password);
        setMessage("Вы успешно зарегистрировались!");
        setWarning("");
        // Очищаем поля ввода
        emailInput.value = "";
        passwordInput.value = "";
      } catch (error) {
        console.error("Ошибка регистрации", error);
      }
    
  };

  return (
    <>
      <button className="registration-button" onClick={openRegistrationModal}>
        Регистрация
      </button>
      {registrationModal ? (
        <div className="modal active">
          <form
            className="registration-form"
            onSubmit={makeRegistrationOnFirebase}
          >
            <div className="cross" onClick={closeRegistrationModal}>
              Х
            </div>
            Почта <input type="email" name="email" />
            Пароль{" "}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="password"
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
