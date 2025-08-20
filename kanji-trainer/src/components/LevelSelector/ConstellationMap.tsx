import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useFeedback } from '../../hooks/useFeedback';
import type { JLPTLevel } from '../../types';

interface ConstellationProps {
  levels: Array<{
    level: JLPTLevel;
    name: string;
    description: string;
    count: number;
  }>;
  selectedLevel: JLPTLevel | null;
  onLevelSelect: (level: JLPTLevel) => void;
}

interface Star {
  id: string;
  level: JLPTLevel;
  x: number;
  y: number;
  size: number;
  brightness: number;
  constellation: string;
}

const constellationData: Record<JLPTLevel, { constellation: string; color: string; description: string }> = {
  N5: { constellation: 'Ursa Major', color: '#22c55e', description: 'The Great Bear - Your journey begins' },
  N4: { constellation: 'Cassiopeia', color: '#3b82f6', description: 'The Queen - Building foundations' },
  N3: { constellation: 'Orion', color: '#8b5cf6', description: 'The Hunter - Growing stronger' },
  N2: { constellation: 'Draco', color: '#f59e0b', description: 'The Dragon - Mastering complexity' },
  N1: { constellation: 'Phoenix', color: '#ef4444', description: 'The Phoenix - Ultimate mastery' },
};

const ConstellationMap: React.FC<ConstellationProps> = ({ levels, selectedLevel, onLevelSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [hoveredLevel, setHoveredLevel] = useState<JLPTLevel | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const feedback = useFeedback();

  // Generate star positions for each constellation
  useEffect(() => {
    const newStars: Star[] = [];
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    levels.forEach((level, levelIndex) => {
      const angle = (levelIndex / levels.length) * 2 * Math.PI - Math.PI / 2;
      const radius = Math.min(canvasSize.width, canvasSize.height) * 0.25;
      const baseX = centerX + Math.cos(angle) * radius;
      const baseY = centerY + Math.sin(angle) * radius;
      
      // Create constellation pattern for each level
      const starCount = Math.min(8, Math.max(3, level.count / 200));
      
      for (let i = 0; i < starCount; i++) {
        const starAngle = (i / starCount) * 2 * Math.PI;
        const starRadius = 40 + Math.random() * 30;
        const jitter = (Math.random() - 0.5) * 20;
        
        newStars.push({
          id: `${level.level}-${i}`,
          level: level.level,
          x: baseX + Math.cos(starAngle) * starRadius + jitter,
          y: baseY + Math.sin(starAngle) * starRadius + jitter,
          size: 2 + Math.random() * 3,
          brightness: 0.3 + Math.random() * 0.7,
          constellation: constellationData[level.level].constellation,
        });
      }
    });
    
    setStars(newStars);
  }, [levels, canvasSize]);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas with dark space background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle stars in background
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const alpha = Math.random() * 0.3;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw constellation connections
      levels.forEach(level => {
        const levelStars = stars.filter(star => star.level === level.level);
        const color = constellationData[level.level].color;
        const isSelected = selectedLevel === level.level;
        const isHovered = hoveredLevel === level.level;
        
        // Draw connections between stars
        if (levelStars.length > 1) {
          ctx.strokeStyle = `${color}${isSelected ? 'ff' : isHovered ? 'aa' : '44'}`;
          ctx.lineWidth = isSelected ? 2 : isHovered ? 1.5 : 1;
          ctx.beginPath();
          
          levelStars.forEach((star, index) => {
            if (index === 0) {
              ctx.moveTo(star.x, star.y);
            } else {
              ctx.lineTo(star.x, star.y);
            }
          });
          ctx.stroke();
        }
      });

      // Draw stars
      stars.forEach(star => {
        const level = levels.find(l => l.level === star.level);
        if (!level) return;
        
        const color = constellationData[star.level].color;
        const isSelected = selectedLevel === star.level;
        const isHovered = hoveredLevel === star.level;
        
        const alpha = isSelected ? 1 : isHovered ? 0.8 : star.brightness;
        const size = star.size * (isSelected ? 1.5 : isHovered ? 1.2 : 1);
        
        // Star glow effect
        if (isSelected || isHovered) {
          const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 3);
          gradient.addColorStop(0, `${color}88`);
          gradient.addColorStop(1, `${color}00`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Main star
        ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [stars, selectedLevel, hoveredLevel, levels]);

  // Handle canvas clicks
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked constellation
    for (const level of levels) {
      const levelStars = stars.filter(star => star.level === level.level);
      const isNearConstellation = levelStars.some(star => {
        const distance = Math.sqrt(Math.pow(x - star.x, 2) + Math.pow(y - star.y, 2));
        return distance < 40; // Click radius
      });

      if (isNearConstellation) {
        feedback.levelSelect();
        onLevelSelect(level.level);
        break;
      }
    }
  };

  // Handle canvas hover
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let newHoveredLevel: JLPTLevel | null = null;

    for (const level of levels) {
      const levelStars = stars.filter(star => star.level === level.level);
      const isNearConstellation = levelStars.some(star => {
        const distance = Math.sqrt(Math.pow(x - star.x, 2) + Math.pow(y - star.y, 2));
        return distance < 40;
      });

      if (isNearConstellation) {
        newHoveredLevel = level.level;
        canvas.style.cursor = 'pointer';
        break;
      }
    }

    if (!newHoveredLevel) {
      canvas.style.cursor = 'default';
    }

    setHoveredLevel(newHoveredLevel);
  };

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const width = Math.min(container.clientWidth, 800);
        const height = Math.min(container.clientHeight, 600);
        setCanvasSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50"
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredLevel(null)}
          className="w-full h-full bg-slate-900"
        />
        
        {/* Level labels */}
        {stars.length > 0 && levels.map((level) => {
          const levelStars = stars.filter(star => star.level === level.level);
          if (levelStars.length === 0) return null;
          
          // Calculate center of constellation
          const centerX = levelStars.reduce((sum, star) => sum + star.x, 0) / levelStars.length;
          const centerY = levelStars.reduce((sum, star) => sum + star.y, 0) / levelStars.length;
          
          const isSelected = selectedLevel === level.level;
          const isHovered = hoveredLevel === level.level;
          const constellation = constellationData[level.level];
          
          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 text-center ${
                isSelected || isHovered ? 'scale-110' : ''
              }`}
              style={{
                left: `${(centerX / canvasSize.width) * 100}%`,
                top: `${(centerY / canvasSize.height) * 100}%`,
              }}
            >
              <div className={`px-3 py-1 rounded-lg backdrop-blur-sm border transition-all duration-300 ${
                isSelected
                  ? 'bg-white/20 border-white/40 text-white'
                  : isHovered
                  ? 'bg-white/10 border-white/20 text-white/90'
                  : 'bg-black/20 border-white/10 text-white/70'
              }`}>
                <div className="font-bold text-sm">{level.name}</div>
                <div className="text-xs opacity-80">{constellation.constellation}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Legend */}
      {(hoveredLevel || selectedLevel) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          {levels.map((level) => {
            if (level.level !== (hoveredLevel || selectedLevel)) return null;
            const constellation = constellationData[level.level];
            
            return (
              <div key={level.level} className="glass-card p-4 max-w-md mx-auto">
                <div className="flex items-center justify-center mb-2">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: constellation.color }}
                  />
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    {level.name} - {constellation.constellation}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  {constellation.description}
                </p>
                <p className="text-xs text-slate-500">
                  {level.count} kanji • {level.description}
                </p>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default ConstellationMap;