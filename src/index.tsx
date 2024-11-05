import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

import { getAuth } from "firebase/auth"; // импортируем функцию getAuth из модуля firebase/auth

// Создаем объект конфигурации Firebase, используя переменные окружения
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
};

console.log('Firebase Config:', firebaseConfig);

//Префикс REACT_APP_: Все переменные окружения, которые вы хотите использовать в вашем 
//React-приложении, должны начинаться с префикса REACT_APP_. Это требование Create React App.

//Безопасность: Не храните конфиденциальные данные, такие как пароли 
//или секретные ключи, в .env файле, так как они будут доступны в сборке и могут быть 
//уязвимы для утечек.

/**
 * Конфигурация Firebase - это набор параметров, 
 * которые используются для настройки подключения вашего приложения к сервисам Firebase. 
 * Конфигурация включает в себя такие параметры, как API key, auth domain, project ID, 
 * storage bucket, messaging sender ID и app ID.
 * 
 * В коде, который вы предоставили, конфигурация Firebase содержится в объекте firebaseConfig. 
 * Этот объект содержит параметры конфигурации, такие как API key, auth domain, project ID, 
 * storage bucket, messaging sender ID и app ID. Эти параметры используются для инициализации 
 * Firebase в вашем приложении и для подключения к сервисам Firebase.
 */


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const database = getDatabase(app);


// Get a reference to the auth service
export const auth = getAuth(app); // получаем объект auth и экспортируем его


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

