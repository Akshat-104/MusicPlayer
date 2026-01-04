import React from 'react'
import { useParams } from 'react-router-dom'
import { useState, useRef , useEffect } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const Favourites = () => {
    const {id} = useParams();
    const [favourite, setFavourite] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const inputRef = useRef(null);
    const [loading , setLoading] = useState(null);
    const [error, setError] = useState(null);


    // Fetch favourites details
      useEffect(() => {
        const fetchFavourite = async () => {
          try {
            const res = await fetch(`http://localhost:4444/api/favourite/${id}`);
            const data = await res.json();
            setFavourite(data);
          } catch (err) {
            console.error("Error fetching playlist:", err);
          }
        };
        fetchFavourite();
      }, [id]);

      // Search Spotify via backend
  const handleSearch = async () => {
    const query = inputRef.current.value;
    if (!query) return;

    try {
      const res = await fetch(`http://localhost:4444/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      // console.log(data);
      setSearchResults([data]); // single track result
    } catch (err) {
      console.error("Error searching track:", err);
    }
  };

  const getVideoIdFromUrl = (url) => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("v"); // returns abc123
};


// Add track to favourite
const handleAddTrack = async (track, TRACKID) => {
  try {
    setLoading(true);
    
    // Step 1: Check if track is already in favourites
    const resTrackInFav = await fetch(`http://localhost:4444/api/search?q=${encodeURIComponent(track.name)}`);
    const dataInFav = await resTrackInFav.json();
    if(dataInFav.id === TRACKID){
        setSearchResults([]);
        inputRef.current.value = "";
        setError("Track Already in Favourites");
        setLoading(false);
        return;
    }

    // Step 0: Check if track already exists in DB
    const trackData = await fetch(`http://localhost:4444/api/alltracks`);
    const res = await trackData.json();

    // Find existing track by title
    let resolvedTrack = res.find((pt) => pt.title === track.name);

    // Step 1: If not found, create track in DB
    if (!resolvedTrack) {
     
      const resTrack = await fetch("http://localhost:4444/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: track.name,
          artist: track.artists.items[0].profile.name,
          duration: track.duration.totalMilliseconds,
          coverUrl: track.albumOfTrack.coverArt.sources[0].url,
        }),
      });
      resolvedTrack = await resTrack.json();
    }

    // Step 2: Attach track to playlist
   
    await fetch(`http://localhost:4444/api/favourites/${id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Favouriteid: id,
        userId: Number(localStorage.getItem("userid")),
        trackId: resolvedTrack.id, // always safe now
        order: favourite.tracks.length + 1,
      }),
    });

    // Step 3: Refresh playlist
   
    const updatedRes = await fetch(`http://localhost:4444/api/favourite/${id}`);
    const updatedPlaylist = await updatedRes.json();
    setFavourite(updatedPlaylist);
    setSearchResults([]);
    inputRef.current.value = "";
  } catch (err) {
    console.error("Error adding track:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-neutral-900 min-h-screen flex items-center justify-center">
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
              href="/showplaylist"
              className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
            >
              Show Playlist
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="/Favourites"
              className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
            >
              Favourites
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
        <h2 className="text-center font-bold text-2xl text-black mb-4">
          {favourite?.name}
        </h2>

        {/* Search bar */}
        <div className="flex space-x-2 mb-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search track..."
            className="flex-grow border px-3 py-2 rounded"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Search
          </button>
        </div>

        {/* Search results */}
        {searchResults.map((track) => (
          <div
            key={track.id}
            className="flex items-center justify-between border p-2 rounded mb-2"
          >
            <div className="flex items-center space-x-3">
              <img
                src={track.albumOfTrack.coverArt.sources[0].url}
                alt={track.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div>
                <p className="font-medium">{track.name}</p>
                <p className="text-sm text-gray-500">
                  {track.artists.items[0].profile.name}
                </p>
                
              </div>
            </div>
            <button
              onClick={() => handleAddTrack(track , track.id)}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Add
            </button>
          </div>
        ))}

        {loading && <div>...Loading</div>}
        {error && (
  <div style={{ color: "red", marginTop: "10px" }}>
    {error}
  </div>
)}

        {/* Favourite tracks */}
        <h3 className="mt-6 font-semibold">Tracks in Favourite</h3>
        <ul className="mt-3 space-y-2">
          {favourite?.tracks?.map((pt) => (
            <li
              key={pt.track.id}
              className="flex items-center space-x-3 border p-2 rounded cursor-pointer transition hover:bg-gray-100"
            >
              <img
                src={pt.track.coverUrl}
                alt={pt.track.title}
                className="w-10 h-10 rounded object-cover"
              />
              <div>
                <p className="font-medium">{pt.track.title}</p>
                <p className="text-sm text-gray-500">{pt.track.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


export default Favourites
