import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useState , useEffect } from 'react';
import "@tailwindplus/elements";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const FavouriteList = () => {
  const [favourites, setFavourites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
      const fetchPlaylists = async () => {
        try {
          const response = await fetch("http://localhost:4444/api/getfavourite");
          const data = await response.json();
          setFavourites(data);
        } catch (err) {
          console.error("Error fetching playlists:", err);
        }
      };
  
      fetchPlaylists();
    }, []);

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
              href="/createplaylist"
              className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
            >
              Create Playlist
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
            >
              Dashboard
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
        <h2 className='text-center font-bold text-2xl text-blue-600 mb-4'>Favourites</h2>
        <ul className="mt-5 space-y-3">
  {favourites.map((favourite) => (
    <li
      key={favourite.id}
      className="p-3 border rounded-lg hover:bg-gray-100 transition flex justify-between cursor-pointer"
      onClick={() => navigate(`/favourite/${favourite.id}`)}
    >
      {favourite.name}
    </li>
  ))}
</ul>
        </div>
      </div>
    </div>
  )
}

export default FavouriteList
