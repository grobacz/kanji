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
                className={`flex flex-col items-center py-5 px-8 transition-all duration-300 focus-ring no-tap-highlight touch-manipulation rounded-xl m-1 group relative overflow-hidden ${
                  isActive
                    ? 'text-white shadow-glow scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:scale-105 hover:shadow-md hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
                style={{
                  minHeight: '64px',
                  minWidth: '80px',
                  ...(isActive ? { background: 'var(--gradient-primary)' } : {})
                }}
                aria-current={isActive ? 'page' : undefined}
                role="tab"
                aria-selected={isActive}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-3">
                    <div 
                      className={`w-7 h-7 flex items-center justify-center transition-transform duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`}
                      style={{ 
                        width: '28px', 
                        height: '28px',
                        minWidth: '28px',
                        minHeight: '28px',
                        maxWidth: '28px',
                        maxHeight: '28px',
                        flexShrink: 0
                      }}
                    >
                      <Icon 
                        className="w-full h-full"
                        style={{ 
                          width: '28px', 
                          height: '28px',
                          maxWidth: '28px',
                          maxHeight: '28px'
                        }}
                        aria-hidden="true" 
                      />
                    </div>
                    <span className={`absolute -top-1 -right-1 text-xs transition-transform duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      {item.emoji}
                    </span>
                  </div>
                  <span className={`text-sm font-bold tracking-wide transition-all duration-300 ${
                    isActive ? 'text-white' : 'group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}>
                    {item.label}
                  </span>
                </div>
                
                {isActive && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-white rounded-full animate-scale-in shadow-sm"></div>
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