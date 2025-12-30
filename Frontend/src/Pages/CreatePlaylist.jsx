import React, { useRef, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid';
import "@tailwindplus/elements";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const CreatePlaylist = () => {

    const [playlists,setPlaylists] = useState([]);
    const [showContent , setShowContent] = useState(false);
    const [message , setMessage] = useState("");
    const inputRef = useRef(null);
    const handleCreate = ()=>{
        const newvalue = inputRef.current.value;
        setPlaylists((prevPlaylists)=>[...prevPlaylists ,newvalue]);
        inputRef.current.value = null;
        setMessage("Playlists Created Successfully!");
        setTimeout(() => {
          setMessage("");
        }, 2500);
    }

  return (
    <div className='bg-neutral-900 min-h-screen flex items-center justify-center'>
        <div className="relative bg-white max-w-md w-full rounded-xl shadow-lg p-10">
          <Menu as="div" className="inline-block absolute top-2 right-2">
      <MenuButton className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50">
        My Profile
        <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          <MenuItem>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
            >
              Account settings
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
            >
              Support
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
            >
              License
            </a>
          </MenuItem>
          <form action="#" method="POST">
            <MenuItem>
              <button
                type="submit"
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
              >
                Sign out
              </button>
            </MenuItem>
          </form>
        </div>
      </MenuItems>
    </Menu>
        <div>
          <h2 className="text-center font-bold text-2xl text-black mb-4">
          MusicPlayer
        </h2>
        </div>


        {/* Search Bar */}
        <div className="w-full mt-4">
        <div className="flex items-center w-full space-x-2">
          <input
    type="text"
    ref={inputRef}
    placeholder="Name Of Playlist"
    className="flex-grow pl-4 py-2 border border-gray-300 rounded-full shadow-sm 
               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
               transition duration-200"/>
          <div className="flex space-x-2">
    {/* Search Button */}
    <button
      onClick={handleCreate}
      className="flex items-center justify-center px-4 py-2 rounded-full 
                 bg-green-600 text-white shadow-md 
                 hover:bg-green-700 transition duration-200 cursor-pointer">
      Create Playlist
    </button>
  </div>
</div>
{/* Temporary message */}
      {message && (
        <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}
            <div className="flex justify-center items-center">
            {playlists.length > 0 && (
              <button className="px-6 py-2 rounded-lg text-white bg-blue-600 shadow hover:bg-blue-700 transition mt-5 cursor-pointer" onClick={()=>setShowContent(!showContent)}>{showContent ? "Hide playlists": "Show Playlists"}</button>
            )}
          </div>
          {showContent && (
                <ul className="mt-5 space-y-3">
                    {playlists.map((playlist , index)=>(
                        <li key = {index} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition mt-5">
                            {playlist}
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  )
}

export default CreatePlaylist
