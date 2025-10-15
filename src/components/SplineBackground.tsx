import { useState, useEffect } from 'react';

export default function SplineBackground() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('SplineBackground component mounted');
    
    // Try to dynamically import Spline to catch any import errors
    const loadSpline = async () => {
      try {
        const Spline = await import('@splinetool/react-spline');
        console.log('Spline imported successfully:', Spline);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to import Spline:', error);
        setHasError(true);
      }
    };

    loadSpline();
  }, []);

  if (hasError) {
    console.log('Showing fallback due to Spline import error');
    return (
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-green-500/20 flex items-center justify-center" 
        style={{ zIndex: 0 }}
      >
        <div className="text-white/70 text-center">
          <p>3D Background Loading...</p>
          <div className="animate-pulse">✨</div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 animate-pulse" 
        style={{ zIndex: 0 }}
      />
    );
  }

  // Dynamic Spline component
  const SplineComponent = () => {
    const [SplineReact, setSplineReact] = useState<any>(null);

    useEffect(() => {
      import('@splinetool/react-spline').then((module) => {
        console.log('Setting Spline component');
        setSplineReact(() => module.default);
      });
    }, []);

    if (!SplineReact) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 animate-pulse" />
      );
    }

    return (
      <SplineReact
        scene="https://prod.spline.design/xSh1yAyu0K8TKMtq/scene.splinecode"
        onLoad={() => console.log('Spline scene loaded successfully')}
        onError={(error: any) => console.error('Spline scene error:', error)}
        style={{ width: '100%', height: '100%' }}
      />
    );
  };

  return (
    <div className="absolute inset-0 w-full h-full">
      <SplineComponent />
    </div>
  );
}