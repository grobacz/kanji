import { Link, useLocation } from 'react-router-dom';
import { 
  AdjustmentsHorizontalIcon,
  PencilIcon,
  BookOpenIcon 
} from '@heroicons/react/24/outline';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/level',
      label: 'Level',
      icon: AdjustmentsHorizontalIcon,
      emoji: '⚙️'
    },
    {
      path: '/write',
      label: 'Write',
      icon: PencilIcon,
      emoji: '✍️'
    },
    {
      path: '/flashcards',
      label: 'Cards',
      icon: BookOpenIcon,
      emoji: '🃏'
    }
  ];

  return (
    <nav 
      className="glass-card border-0 mx-4 mb-4 rounded-2xl safe-area-inset-bottom overflow-hidden" 
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-2">
        <div className="flex justify-center" role="tablist" aria-label="Navigation tabs">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-4 px-6 transition-all duration-300 focus-ring no-tap-highlight touch-manipulation min-h-16 rounded-xl m-1 group relative overflow-hidden ${
                  isActive
                    ? 'text-white shadow-glow scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:scale-105 hover:shadow-md'
                }`}
                style={isActive ? { background: 'var(--gradient-primary)' } : {}}
                aria-current={isActive ? 'page' : undefined}
                role="tab"
                aria-selected={isActive}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-2">
                    <div 
                      className={`w-6 h-6 flex items-center justify-center transition-transform duration-300 ${
                        isActive ? 'scale-105' : 'group-hover:scale-105'
                      }`}
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        minWidth: '24px',
                        minHeight: '24px',
                        maxWidth: '24px',
                        maxHeight: '24px',
                        flexShrink: 0
                      }}
                    >
                      <Icon 
                        className="w-full h-full"
                        style={{ 
                          width: '24px', 
                          height: '24px',
                          maxWidth: '24px',
                          maxHeight: '24px'
                        }}
                        aria-hidden="true" 
                      />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 text-[10px] opacity-80">
                      {item.emoji}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold tracking-wide ${
                    isActive ? 'text-white' : ''
                  }`}>
                    {item.label}
                  </span>
                </div>
                
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full animate-scale-in"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;