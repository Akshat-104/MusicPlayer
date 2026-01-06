import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  XMarkIcon,
  ArrowPathIcon,
  HeartIcon,
  ArrowPathRoundedSquareIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const PlaylistPage = () => {
  const { id } = useParams(); // playlist id
  const [idCheck,setIdCheck] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [trackKey , setTrackKey] = useState(null);
  const inputRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [time, setTime] = useState(0); // seconds
  const [duration, setDuration] = useState(0); // seconds
  const [volume, setVolume] = useState(60); // 0–100
  const [activeVideo, setActiveVideo] = useState(null);
  const playerRef = useRef(null);
  const [isLooping , setIsLooping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [idx , setIdx] = useState(null);
  const [favourites, setFavourites] = useState([]);

  // Fetch playlist details
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await fetch(`http://localhost:4444/api/playlist/${id}`);
        const data = await res.json();
        setPlaylist(data);
      } catch (err) {
        console.error("Error fetching playlist:", err);
      }
    };
    fetchPlaylist();
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


  // Add track to playlist
  const handleAddTrack = async (track) => {
    try {
      // Step 1: Create track in DB (with YouTube URL)
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
      const createdTrack = await resTrack.json();

      // Step 2: Attach track to playlist
      await fetch(`http://localhost:4444/api/playlists/${id}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: createdTrack.id,
          order: playlist.tracks.length + 1, // append at end
        }),
      });

      // Step 3: Refresh playlist
      const updatedRes = await fetch(`http://localhost:4444/api/playlist/${id}`);
      const updatedPlaylist = await updatedRes.json();
      setPlaylist(updatedPlaylist);
      setSearchResults([]); // clear search results
    } catch (err) {
      console.error("Error adding track:", err);
    }
  };

  const handleStateChange = (event)=>{
  if (event.data === window.YT.PlayerState.ENDED) {
    skipNext();
  } else if (event.data === window.YT.PlayerState.PLAYING) {
    setIsPlaying(true);
  } else if (event.data === window.YT.PlayerState.PAUSED) {
    setIsPlaying(false);
  }
}

    useEffect(() => {
        let waitInterval;
    
        const createPlayer = () => {
          if (!activeVideo || !showPopup) return;
          if (!window.YT || !window.YT.Player) return; // guard until script ready
    
          playerRef.current = new window.YT.Player("yt-player", {
            videoId: activeVideo,
            playerVars: {
              controls: 0,
              disablekb: 1,
              modestbranding: 1,
              rel: 0,
            },
            events: {
              onReady: (event) => {
                const total = Math.floor(event.target.getDuration() || 0);
                setDuration(total);
                event.target.setVolume(volume);
                event.target.playVideo();
                setIsPlaying(true);
              },
              onStateChange: handleStateChange
            },
          });
        };
    
        // If YT isn't ready yet, wait briefly
        if (activeVideo && showPopup) {
          if (window.YT && window.YT.Player) {
            createPlayer();
          } else {
            waitInterval = setInterval(() => {
              if (window.YT && window.YT.Player) {
                clearInterval(waitInterval);
                createPlayer();
              }
            }, 200);
          }
        }
    
        return () => {
          clearInterval(waitInterval);
          if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
          }
        };
      }, [activeVideo, showPopup]);

      useEffect(() => {
          let interval;
          if (isPlaying && playerRef.current) {
            interval = setInterval(() => {
              const current = Math.floor(playerRef.current.getCurrentTime() || 0);
              const total = Math.floor(playerRef.current.getDuration() || duration || 0);
              setTime(current);
              setDuration(total);
              setProgress(total ? (current / total) * 100 : 0);
            }, 1000);
          }
          return () => clearInterval(interval);
        }, [isPlaying, duration]);

    const openPopup = (index , key)=>{
      const clickedtrack = playlist.tracks[index].track.url;
      const videoid = getVideoIdFromUrl(clickedtrack);
      setTrackKey(key);
      setActiveVideo(videoid);
      setShowPopup(true);
      setIdx(index);
      setProgress(0);
      setTime(0);
      setDuration(0);
      // if(playerRef.current){
      //   playerRef.current.seekTo(0);
      //   playerRef.current.playVideo();
      // }
    };

    const closePopup = () => {
    setActiveVideo(null);
    // setActiveSnippet(null);
    setShowPopup(false);
    setIsPlaying(false);
    setProgress(0);
    setTime(0);
    setDuration(0);
  };

  // Play/pause toggle
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  // Seek via slider
  const handleSeek = (e) => {
    if (!playerRef.current || !duration) return;
    const newProgress = Number(e.target.value);
    const newTime = (newProgress / 100) * duration;
    playerRef.current.seekTo(newTime, true);
    setTime(Math.floor(newTime));
    setProgress(newProgress);
  };

  // Volume slider
  const handleVolume = (e) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    playerRef.current?.setVolume(newVolume);
  };

  useEffect(() => {
  if (playlist && playlist.tracks && playlist.tracks[idx]) {
    const videoUrl = playlist.tracks[idx].track.url;
    const videoId = getVideoIdFromUrl(videoUrl);
    setActiveVideo(videoId);
  }
}, [idx, playlist]);


  // Skip next/previous
  const skipNext = () => {
    console.log(playlist);
  if (idx === null) return;

  if (idx < playlist.tracks.length - 1) {
    // go to next track
    setIdx(idx + 1);
  } else {
    // reached end of playlist
    if (isLooping) {
      // loop back to first track
      setIdx(0);
    } else {
      // stop playback
      setIsPlaying(false);
    }
  }
};

const skipPrevious = () => {
  if (idx === null) return;

  if (idx > 0) {
    const prevIndex = idx - 1;
    const videoUrl = playlist.tracks[idx].track.url;
    const videoId = getVideoIdFromUrl(videoUrl);
    setIdx(prevIndex);
    setActiveVideo(videoId);
  }
};

  // Formatting helpers
  const formatTime = (seconds) => {
    const m = Math.floor((seconds || 0) / 60);
    const s = Math.floor(seconds || 0) % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    const fetchFavourites = async () => {
      const res = await fetch("http://localhost:4444/api/getfavourite");
      const data = await res.json();
      setFavourites(data);
    };
    fetchFavourites();
  }, []);


  const toggleFavourite = async (track)=>{
    const favid = favourites[0].id;
    // console.log(favourites);
    const Id = favourites[0].id;
    var Order = 1;
     const res = await fetch(`http://localhost:4444/api/favourite/${favid}`);
     const data = await res.json();
     Order = data.tracks.length + 1;
      await fetch(`http://localhost:4444/api/favourites/${Id}/track`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        Favouriteid: Id,
        userId:favourites[0].userId,
        trackId:track,
        order:Order
      }),
    });
    console.log(favourites);
  }

  useEffect(() => {
    const check = async () => {
      await CheckIsFav();
      // console.log(idCheck);
    };
    check();
  }, [trackKey , idCheck]);

  const handleToggle = async () => {
    // Optimistically flip UI state
    const nextState = !idCheck;
setIdCheck(nextState);
    if(nextState){
      await toggleFavourite(trackKey);
    }
    else{
      const favid = favourites[0].id;
      await fetch(`http://localhost:4444/api/favourites/${favid}/track/${trackKey}`,{
        method:"DELETE",
        headers:{"Content-Type":"application-json"}
      })
      const res = await fetch(`http://localhost:4444/api/favourite/${favid}`);
      const data = await res.json();
      setFavourites(data);
    }
    // Optionally re-check from backend if needed
    // const fav = await CheckIsFav(trackKey);
    // setIsFav(fav);
  };



  const CheckIsFav = async()=>{
    const favid = favourites[0].id;
    try{
     const res = await fetch(`http://localhost:4444/api/favourite/${favid}`);
     const data = await res.json();
    //  console.log(data);
     if(data.tracks.find((isfav)=>isfav.trackId === trackKey)){
      setIdCheck(true);
     }else{
      setIdCheck(false);
     }
    }catch(err){
      console.log(err);
    }
  }

  if (!playlist) return <p>Loading...</p>;
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
        <h2 className="text-center font-bold text-2xl text-black mb-4">
          {playlist.name}
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
              {console.log(searchResults)}
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
              onClick={() => handleAddTrack(track)}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Add
            </button>
          </div>
        ))}

        {/* Playlist tracks */}
        <h3 className="mt-6 font-semibold">Tracks in Playlist</h3>
        <ul className="mt-3 space-y-2">
          {playlist.tracks.map((pt,index) => (
            <li
              key={pt.track.id}
              className="flex items-center space-x-3 border p-2 rounded cursor-pointer transition hover:bg-gray-100"
              onClick={()=>openPopup(index , pt.track.id)}
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

          {/* Popup Modal */}
          {showPopup && activeVideo && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
              <div className="bg-neutral-800 bg-opacity-80 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-[420px] relative text-white">
                
                {/* Close button */}
                <button
                  onClick={closePopup}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center 
                             rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
          
                {/* Hidden YouTube Player container */}
                <div id="yt-player" className="w-0 h-0 opacity-0"></div>
          
                {/* Album art + info */}
                <div className="flex flex-col items-center">
                  {playlist?.tracks?.[idx]?.track?.coverUrl && (
                    <img
                      src={playlist.tracks[idx].track.coverUrl}
                      alt="cover"
                      className={`rounded-xl mb-4 shadow-lg w-52 h-52 object-cover ${
                        isPlaying ? "animate-spin-slow" : ""
                      }`}
                    />
                  )}
          
                  {/* Title neatly centered */}
                  <div className="w-full flex justify-center mb-1">
                    <p className="font-bold text-lg text-center max-w-[90%] truncate">
                      {playlist.tracks?.[idx]?.track?.title ?? ""}
                    </p>
                  </div>
          
                  <p className="text-sm text-gray-300 mb-4 text-center">
                    {playlist.tracks?.[idx]?.track?.artist ?? ""}
                  </p>
          
                  {/* Controls row */}
                  <div className="flex items-center justify-center space-x-6 mb-3">
                    {/* Repeat */}
                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className="w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition cursor-pointer"
                      title="Repeat"
                    >
                      {isLooping ? (
                        <ArrowPathRoundedSquareIcon className="h-6 w-6 text-blue-500" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-gray-500" />
                      )}
                    </button>
          
                    {/* Backward */}
                    <button
                      onClick={skipPrevious}
                      disabled={idx === null || idx <= 0}
                      className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition ${
                        idx > 0
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <BackwardIcon className="w-6 h-6" />
                    </button>
          
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlayPause}
                      className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg transition 
                        ${isPlaying ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"} text-white`}
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-8 h-8" />
                      ) : (
                        <PlayIcon className="w-8 h-8 ml-1" />
                      )}
                    </button>
          
                    {/* Forward */}
                    <button
                      onClick={skipNext}
                      disabled={idx === null}
                      className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition ${
                        idx !== null
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <ForwardIcon className="w-6 h-6" />
                    </button>
          
                    {/* Favourite */}
                    <button
                      onClick={handleToggle}
                      className={`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition ${
                        idCheck
                          ? "bg-red-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                      title="Add to Favourites"
                    >
                      <HeartIcon className="w-5 h-5" />
                    </button>
                  </div>
          
                  {/* Progress bar */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full accent-green-500 mb-2"
                  />
                  <p className="text-xs text-gray-400 mb-4 w-full flex justify-between">
                    <span>{formatTime(time)}</span>
                    <span>{formatTime(duration)}</span>
                  </p>
          
                  {/* Volume control */}
                  <div className="w-full flex items-center space-x-3">
                    <SpeakerWaveIcon className="w-5 h-5 text-gray-300" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolume}
                      className="flex-1 accent-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

      </div>
    </div>
  );
};

export default PlaylistPage;