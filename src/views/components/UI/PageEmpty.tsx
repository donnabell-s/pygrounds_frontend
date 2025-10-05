import React from 'react';

type Props = {
  title?: string;
  subtitle?: string;
  className?: string;
};

const PageEmpty: React.FC<Props> = ({ title = 'No data yet', subtitle, className }) => {
  return (
    <div className={[
      'w-full h-full min-h-[240px] flex flex-col items-center justify-center gap-3 text-center p-6',
      className || ''
    ].join(' ')}>
      <h2 className="text-2xl md:text-3xl font-semibold text-[#374151]">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 max-w-xl">{subtitle}</p>}
    </div>
  );
};

export default PageEmpty;
