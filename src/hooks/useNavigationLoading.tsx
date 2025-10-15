import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show loading when navigating to homepage (root path)
    if (location.pathname === '/') {
      setIsLoading(true);
      
      // Simulate loading time for homepage
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000); // 2 seconds loading time for enhanced animation

      return () => clearTimeout(timer);
    } else {
      // No loading for other pages
      setIsLoading(false);
    }
  }, [location.pathname]);

  return isLoading;
}

export default useNavigationLoading;
