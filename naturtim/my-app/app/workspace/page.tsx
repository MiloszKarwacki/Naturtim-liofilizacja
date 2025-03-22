"use client";

import React, { useState, useEffect } from "react";

const Workspace = () => {
  // Zakładamy, że nazwa aktualnie zalogowanego użytkownika pochodzi z kontekstu autoryzacji.
  // Przyjmujemy przykładową nazwę, np. "Janek".
  const userName = "Janek"; // W realnej aplikacji pobierz tę wartość z session/context/auth

  // State do przechowywania aktualnego czasu
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Ustawiamy timer, który co sekundę aktualizuje czas
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Sprzątamy po sobie, żeby uniknąć wycieków pamięci
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">
        Witaj, {userName}!
      </h1>
      <p className="text-xl mb-2">
        Aktualny czas: {currentTime.toLocaleTimeString()}
      </p>
      <p className="text-lg">
        Życzę udanej pracy i pełnej energii realizacji zadań! Have a great day!
      </p>
    </div>
  );
};

export default Workspace;
