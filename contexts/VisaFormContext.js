// contexts/VisaFormContext.js

import React, { createContext, useState } from 'react';

export const VisaFormContext = createContext();

export const VisaFormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: null,
    passportNumber: '',
    country: '',
    passportPhoto: null,
  });

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <VisaFormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </VisaFormContext.Provider>
  );
};
