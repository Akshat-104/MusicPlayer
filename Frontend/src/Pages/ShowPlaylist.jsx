import React from 'react'
import "@tailwindplus/elements";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ShowPlaylist = () => {
     const [playlists, setPlaylists] = useState([]);
     const navigate = useNavigate();
    useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch("http://localhost:4444/api/getplaylists");
        const data = await response.json();
        setPlaylists(data);
      } catch (err) {
        console.error("Error fetching playlists:", err);
      }
    };

    fetchPlaylists();
  }, []);

  const deletePlaylist = async (Id)=>{
    try{
        const response = await fetch("http://localhost:4444/api/deleteplaylist" , {
        method:"DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          id: Id,
        }),
      });
      if(response.ok){
        setPlaylists((prev) => prev.filter((p) => p.id !== Id));
      }else{
        console.error("Failed to delete playlist:", await response.text());
      }
    }catch(err){
      console.error("Error : ", err);
    }
  }

  const handleSignOut = async(req,res)=>{
    await fetch(`http://localhost:4444/api/signout` , {
      method:"POST"
    })
    localStorage.removeItem("token");
    localStorage.removeItem("userid");
    localStorage.removeItem("userName");
    navigate("/");
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
              href="/showFavourites"
              className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
            >
              Favourites
            </a>
          </MenuItem>
          <form>
            <MenuItem>
              <button
              onClick={handleSignOut}
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
        <h2 className='text-center font-bold text-2xl text-blue-600 mb-4'>Playlists</h2>
        <ul className="mt-5 space-y-3">
  {playlists.map((playlist) => (
    <div
      key={playlist.id}
      className="p-3 border rounded-lg hover:bg-gray-100 transition flex justify-between"
    >
      <button className='flex-col px-2 py-2 bg-green-600 rounded shadow-md text-white justify-between cursor-pointer' onClick={() => navigate(`/playlist/${playlist.id}`)}>{playlist.name}</button>
      <button
      onClick={()=> deletePlaylist(playlist.id)}
      className="flex-col justify-between px-2 py-2 rounded-full 
                 bg-green-600 text-white shadow-md 
                 hover:bg-green-700 transition duration-200 cursor-pointer">
      Delete Playlist
    </button>
    </div>
  ))}
</ul>


        </div>
      </div>
    </div>
  )
}

export default ShowPlaylist
