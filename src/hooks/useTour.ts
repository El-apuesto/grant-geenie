import { useState, useEffect } from 'react';

const TOUR_STORAGE_KEY = 'grant-hustle-tour-completed';

export function useTour() {
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Check if user has completed tour before
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    setHasCompletedTour(completed === 'true');

    // Check URL for tour query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tour') === 'genie') {
      setIsTourActive(true);
    }
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
