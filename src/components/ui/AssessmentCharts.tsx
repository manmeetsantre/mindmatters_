import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartProps {
  score: number;
  maxScore: number;
  severity: string;
  toolName: string;
  color: string;
}

// Animated Pie Chart for assessment results
export const AssessmentPieChart: React.FC<ChartProps> = ({ 
  score, 
  maxScore, 
  severity, 
  toolName, 
  color 
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [score]);
  
  const data = [
    { name: 'Score', value: animatedScore },
    { name: 'Remaining', value: maxScore - animatedScore }
  ];
  
  const COLORS = [color, '#e5e7eb'];
  
  return (
    <div className="w-full h-64 flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}`, 'Value']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <div className="text-2xl font-bold">{score}/{maxScore}</div>
        <div className="text-sm text-muted-foreground">{toolName}</div>
      </div>
    </div>
  );
};

// Animated Circle Progress for assessment results
export const AnimatedCircleProgress: React.FC<ChartProps> = ({
  score,
  maxScore,
  severity,
  toolName,
  color
}) => {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 45; // 45 is the radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const [offset, setOffset] = useState(circumference);
  const [fillOpacity, setFillOpacity] = useState(0);
  
  useEffect(() => {
    // Reset animation state
    setOffset(circumference);
    setFillOpacity(0);
    
    // Start animation after a short delay
    const timer1 = setTimeout(() => {
      setOffset(strokeDashoffset);
    }, 300);
    
    // Start fill animation after the stroke animation begins
    const timer2 = setTimeout(() => {
      setFillOpacity(0.15); // Semi-transparent fill
    }, 600);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [strokeDashoffset, circumference]);
  
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-56 h-56 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-gray-200 dark:text-gray-700"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          {/* Shaded area */}
          <circle
            className="transition-all duration-2000 ease-out"
            strokeWidth="0"
            fill={color}
            fillOpacity={fillOpacity}
            r="45"
            cx="50"
            cy="50"
            clipPath="url(#progressClip)"
          />
          {/* Progress circle - starting from top (12 o'clock position) */}
          <circle
            className="transition-all duration-2000 ease-out"
            strokeWidth="8"
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ 
              transition: 'stroke-dashoffset 2s ease-in-out',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center'
            }}
          />
          {/* Clip path for the shaded area */}
          <defs>
            <clipPath id="progressClip">
              <path 
                d={`M50,50 L50,5 A45,45 0 ${percentage > 50 ? 1 : 0},1 ${
                  50 + 45 * Math.sin((percentage / 100) * 2 * Math.PI)
                },${
                  50 - 45 * Math.cos((percentage / 100) * 2 * Math.PI)
                } Z`}
              />
            </clipPath>
          </defs>
          {/* Text in the middle - removed score text as requested */}
        </svg>
      </div>
      <div className="mt-3 text-center">
        <div className="text-base font-medium">{toolName}</div>
        <div className="text-sm text-muted-foreground capitalize">{severity} severity</div>
      </div>
    </div>
  );
};

// Chat-like bubble for assessment results
export const ChatBubbleResult: React.FC<ChartProps> = ({
  score,
  maxScore,
  severity,
  toolName,
  color
}) => {
  const percentage = (score / maxScore) * 100;
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [percentage]);
  
  return (
    <div 
      className="rounded-2xl p-4 mb-4 max-w-xs mx-auto opacity-100 scale-100 transition-all duration-500"
      style={{ backgroundColor: `${color}20`, borderColor: color, borderWidth: '1px' }}
    >
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: color }}>
          <span className="text-white text-xs font-bold">{toolName.split('-')[0]}</span>
        </div>
        <div className="font-medium">{toolName}</div>
      </div>
      <div className="mb-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full transition-all duration-1000" 
            style={{ backgroundColor: color, width: `${width}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <div>Score: <span className="font-bold">{score}/{maxScore}</span></div>
        <div className="capitalize">{severity}</div>
      </div>
    </div>
  );
};

// Helper function to get color based on severity
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'minimal': return '#10b981'; // green
    case 'mild': return '#f59e0b'; // yellow
    case 'moderate': return '#f97316'; // orange
    case 'moderately-severe': return '#ef4444'; // red
    case 'severe': return '#b91c1c'; // dark red
    default: return '#6b7280'; // gray
  }
}