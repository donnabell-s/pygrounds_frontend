import { useState } from "react";
import * as Components from "../../../components";
import { FiMenu } from "react-icons/fi";


const PythonLearn = () => {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex flex-row items-center gap-2">
      <button 
        onClick={() => setMenuOpen(prev => !prev)} 
        className={`focus:outline-none ${menuOpen ? 'text-[#3776AB]' : 'text-gray-700 hover:text-[#3776AB]'}`}
      >
        <FiMenu size={22} />
      </button>
        <h1 className="text-2xl font-bold">Python Learning Course</h1>
      </div>

    <div className="flex flex-row gap-2">
      <div
        className={`
          shadow-md rounded-md transition-all duration-300 
          ${menuOpen ? 'w-[30%] md:w-[22%] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4'}
          overflow-hidden
        `}
      >
        <Components.TopicMenu />
      </div>

      <div className="flex-1">
        <Components.ReadingMaterial />
      </div>
    </div>

    </div>
  );
};

export default PythonLearn;
