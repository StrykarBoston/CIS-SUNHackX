import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Check local storage first, fallback to dark mode for default as the app is premium/dark centered
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('conflict-ai-theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return true; // Default to dark
  });

  useEffect(() => {
    // Add or remove .dark class on HTML root element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('conflict-ai-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('conflict-ai-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
