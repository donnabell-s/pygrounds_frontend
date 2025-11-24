import React from 'react';

interface StatusBadgeProps {
  status: string;
  error?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  error, 
  className = '', 
  size = 'md'
}) => {
  const getStatusConfig = () => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'processing':
      case 'pending':
      case 'generating':
      case 'validating':
      case 'uploading':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          text: status
        };
      case 'completed':
      case 'success':
      case 'generated':
      case 'validated':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          text: status
        };
      case 'failed':
      case 'error':
      case 'not_validated':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          text: status
        };
      case 'not_started':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          text: 'Not Started'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          text: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig();
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <div 
      className={`inline-flex items-center justify-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]} ${className}`}
      title={error || `Status: ${config.text}`}
    >
      <span className="capitalize">{config.text}</span>
    </div>
  );
};

export default StatusBadge;