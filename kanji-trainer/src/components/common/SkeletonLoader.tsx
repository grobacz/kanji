import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'circle' | 'kanji' | 'button';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1
}) => {
  const getSkeletonStyles = () => {
    switch (variant) {
      case 'card':
        return {
          width: width || '100%',
          height: height || 'clamp(300px, 50vh, 400px)',
          borderRadius: '12px'
        };
      case 'kanji':
        return {
          width: width || '200px',
          height: height || '200px',
          borderRadius: '12px'
        };
      case 'circle':
        return {
          width: width || '40px',
          height: height || '40px',
          borderRadius: '50%'
        };
      case 'button':
        return {
          width: width || '120px',
          height: height || '48px',
          borderRadius: '12px'
        };
      default: // text
        return {
          width: width || '100%',
          height: height || '20px',
          borderRadius: '4px'
        };
    }
  };

  const skeletonVariants = {
    loading: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  };

  const items = Array.from({ length: count }, (_, index) => (
    <motion.div
      key={index}
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${className}`}
      style={getSkeletonStyles()}
      variants={skeletonVariants}
      animate="loading"
    />
  ));

  return count === 1 ? items[0] : <div className="space-y-3">{items}</div>;
};

export default SkeletonLoader;