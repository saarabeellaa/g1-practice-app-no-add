import React from 'react';
import { useMockTests } from '../../hooks/useData.js';

export const MockTestsContext = React.createContext(null);

export function MockTestsProvider({ children }) {
  const [tests, loadingTests] = useMockTests();
  
  return (
    <MockTestsContext.Provider value={{ tests, loadingTests }}>
      {children}
    </MockTestsContext.Provider>
  );
}