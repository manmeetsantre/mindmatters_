import { useState, useEffect } from "react";

// Space-themed background images for crew mental health monitoring
const images = [
  "https://img.freepik.com/premium-photo/astronaut-outer-space-against-backdrop-planet-earth-elements-this-image-furnished-by-nasa_564276-2695.jpg",
  "https://img.freepik.com/premium-photo/3d-illustration-space-station-earth-planet-orbit-digital-space-art-realistic-visualization_846250-2514.jpg",
  "https://img.freepik.com/premium-photo/astronaut-spacewalk-mixed-media_641298-99.jpg",
  "https://img.freepik.com/premium-photo/galaxy-with-planet_1003030-16166.jpg",
  "https://cdn.pixabay.com/video/2024/05/25/213648_tiny.jpg",
  "https://static.vecteezy.com/system/resources/previews/037/334/126/non_2x/ai-generated-alone-in-the-space-free-photo.jpg",
  "https://static.vecteezy.com/system/resources/thumbnails/024/536/492/small_2x/space-shuttle-taking-off-into-the-sky-created-with-generative-ai-technology-photo.jpg"
];

interface SlideshowBackgroundProps {
  className?: string;
}

export const SlideshowBackground = ({ className = "" }: SlideshowBackgroundProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fadeClass, setFadeClass] = useState("opacity-0");

  useEffect(() => {
    // Preload first image
    const firstImage = new Image();
    firstImage.onload = () => {
      setIsLoaded(true);
      setFadeClass("opacity-100");
    };
    firstImage.src = images[0];

    const interval = setInterval(() => {
      setFadeClass("opacity-0");
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setFadeClass("opacity-100");
    }, 8000); // Change image every 8 seconds with seamless transitions

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden animate-fade-in ${className}`}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
            index === currentIndex ? `${fadeClass} scale-100` : "opacity-0 scale-105"
          }`}
        >
          <img
            src={image}
            alt={`Space station crew mental health monitoring ${index + 1}`}
            className="w-full h-full object-cover object-center transition-transform duration-[3000ms] ease-out"
            style={{ filter: 'brightness(0.6) contrast(1.6) saturate(1.3)' }}
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
      
      {/* Multi-layer overlay for optimal text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary-glow/25 to-accent/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/25 via-transparent to-background/15" />
      <div className="absolute inset-0 bg-gradient-hero/50" />
      
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-hero animate-pulse" />
      )}
    </div>
  );
};