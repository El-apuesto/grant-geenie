import { useState, useEffect } from 'react';

const TOUR_STORAGE_KEY = 'grant-hustle-tour-completed';

export function useTour() {
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Check if user has completed tour before
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    setHasCompletedTour(completed === 'true');

    // DISABLED: Do NOT auto-start tour, only manual via lamp icon
    // Users need to see dashboard first, not tour
  }, []);

  const startTour = () => {
    setIsTourActive(true);
  };

  const completeTour = () => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  const skipTour = () => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  return {
    isTourActive,
    hasCompletedTour,
    startTour,
    completeTour,
    skipTour,
  };
}
