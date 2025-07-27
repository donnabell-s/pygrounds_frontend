import React from "react";
import { Outlet } from "react-router-dom";
import * as Component from "../../../../components";


const RegisterMain = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F9FAFB] text-[#2D2D2D]">
      <Component.Header />

      <main className="flex flex-1">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto">
          {/* Always-mounted progress tracker for smooth animations */}
          <div className="mt-8 p-7 bg-white rounded-md shadow-md">
          <Component.RegisterProgressTracker />

          {/* Route content swaps here without unmounting the tracker */}
          <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterMain;