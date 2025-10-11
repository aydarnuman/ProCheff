import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>
    </header>
  );
};

export default Header;