import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function FloatingActionButton() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  useEffect(() => {
    // Set initial position to bottom-right
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 56, dragRef.current.initialX + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - 56, dragRef.current.initialY + deltaY));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const actions = [
    {
      icon: MessageCircle,
      label: t('fab.ai.chat'),
      href: "/ai-chat",
      bgColor: "bg-primary",
      hoverColor: "hover:shadow-primary/50"
    },
    {
      icon: Phone,
      label: t('fab.emergency'),
      href: "tel:18005990019",
      bgColor: "bg-gradient-to-r from-red-500 to-red-600",
      hoverColor: "hover:shadow-red-500/50"
    },
    {
      icon: HelpCircle,
      label: t('fab.help'),
      href: "/resources",
      bgColor: "bg-primary",
      hoverColor: "hover:shadow-primary/50"
    }
  ];

  return (
    <div 
      ref={fabRef}
      className="fixed z-50 cursor-move"
      style={{ 
        left: position.x, 
        top: position.y,
        transition: isDragging ? 'none' : 'all 0.3s ease'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Action Items */}
      <div className={cn(
        "absolute bottom-16 right-0 space-y-3 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <Link
            key={action.label}
            to={action.href}
            className="block"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <Button
              size="sm"
              className={cn(
                "w-auto px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300",
                action.bgColor,
                action.hoverColor,
                "text-white border-0 hover:scale-105"
              )}
            >
              <action.icon className="w-4 h-4 mr-2" />
              <span className="whitespace-nowrap">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
          isOpen 
            ? "bg-gradient-to-r from-red-500 to-red-600 rotate-45" 
            : "bg-primary hover:scale-105",
          "border-0 hover:shadow-glow"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </Button>
    </div>
  );
}