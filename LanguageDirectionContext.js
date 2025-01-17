// LanguageDirectionContext.js
import React, { createContext, useContext, useState } from 'react';

const LanguageDirectionContext = createContext();

export const LanguageDirectionProvider = ({ children }) => {
  const [direction, setDirection] = useState('ltr');

  return (
    <LanguageDirectionContext.Provider value={{ direction, setDirection }}>
      {children}
    </LanguageDirectionContext.Provider>
  );
};

export const useDirection = () => {
  return useContext(LanguageDirectionContext);
};