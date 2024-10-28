import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

import { getAuth } from "firebase/auth"; // импортируем функцию getAuth из модуля firebase/auth

// Your web app's Firebase configuration конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyCFTEiWXdI50_No7UwYKK7aK2XXUM__TZ0",
  authDomain: "tabata-timer-lizaansver.firebaseapp.com",
  projectId: "tabata-timer-lizaansver",
  storageBucket: "tabata-timer-lizaansver.appspot.com",
  messagingSenderId: "917284937530",
  appId: "1:917284937530:web:a9ce302134564ebb8f3a03",
  measurementId: "G-1Z558LHQRR"
};
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
console.log(database)

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

