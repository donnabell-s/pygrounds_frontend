import { Outlet } from 'react-router'
import * as Components from "../../../components"

const UserMain = () => {
  return (
    <div className='min-h-screen w-full flex flex-col bg-[#F9FAFB] text-[#2D2D2D]'>
      <Components.Header></Components.Header>
      <main className='flex flex-1'>
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default UserMain