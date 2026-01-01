import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 shadow-md overflow-hidden flex flex-col ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
          <h3 className="text-lg font-medium leading-6 text-white tracking-wide">{title}</h3>
        </div>
      )}
      <div className="p-6 flex-1">
        {children}
      </div>
    </div>
  );
};

export default Card;