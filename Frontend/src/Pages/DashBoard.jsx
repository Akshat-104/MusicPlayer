import React, { useState, useRef, useEffect } from "react";
import backupCover from "../../images/Spotify_logo_without_text.svg.png"
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
} from "@heroicons/react/24/solid";

const DashBoard = () => {
  const inputRef = useRef(null);

  // Results and active track
  const [results, setResults] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeSnippet, setActiveSnippet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [isLooping , setIsLooping] = useState(false);

  // Player state
  const [showPopup, setShowPopup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [time, setTime] = useState(0); // seconds
  const [duration, setDuration] = useState(0); // seconds
  const [volume, setVolume] = useState(60); // 0–100
  const [showFavs, setShowFavs] = useState(false);


  const playerRef = useRef(null);

  const toggleFavourite = async (videoId, snippet) => {
  const token = localStorage.getItem("token"); // 👈 define it here
  const userId = localStorage.getItem("userid");

  if (!token) {
    console.error("No token found. User must be logged in.");
    return;
  }

  const exists = favourites.find((fav) => fav.videoId === videoId);

  if (exists) {
    await fetch(`http://localhost:4444/api/favourites/${videoId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({userId}),
    });
    setFavourites(favourites.filter((fav) => fav.videoId !== videoId));
  } else {
    const res = await fetch("http://localhost:4444/api/favourites", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
      userId,
      videoId,
      title: snippet.title,
      channel: snippet.channelTitle,
      thumbnail: snippet.thumbnails.medium.url,
    }),
});

    const fav = await res.json();
    setFavourites([...favourites, fav]);
  }
};
const userId = localStorage.getItem("userid");
     // fetch favourite songs
  const fetchFavourites = async () => {
    try {
      const res = await fetch(`http://localhost:4444/api/favourites/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setFavourites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching favourites:", err);
    }
  };

  const isLoopingRef = useRef(isLooping);
useEffect(() => {
  isLoopingRef.current = isLooping;
}, [isLooping]);

const handleStateChange = (event)=>{
  if (event.data === window.YT.PlayerState.ENDED) {
    if (isLoopingRef.current) {
      // reload same video cleanly
      event.target.stopVideo();
      event.target.seekTo(0);
      event.target.playVideo(); // ensure playback starts
    } else {
      skipNext();
    }
  } else if (event.data === window.YT.PlayerState.PLAYING) {
    setIsPlaying(true);
  } else if (event.data === window.YT.PlayerState.PAUSED) {
    setIsPlaying(false);
  }
}
  // Create/destroy player when popup opens or activeVideo changes
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

  // Update progress/time every second while playing
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

  // Keyboard shortcuts: Space play/pause, arrows for skip/volume
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!showPopup) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        skipNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        skipPrevious();
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        const v = Math.min(100, volume + 5);
        setVolume(v);
        playerRef.current?.setVolume(v);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        const v = Math.max(0, volume - 5);
        setVolume(v);
        playerRef.current?.setVolume(v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPopup, volume]);

  // Search videos
  const handleSearch = async () => {
    const query = inputRef.current.value.trim();
    if (!query) return;

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
          query
        )}&maxResults=10&key=${
          import.meta.env.VITE_YOUTUBE_KEY
        }`
      );
      const data = await res.json();
      const items = data.items || [];
      setResults(items);
      // Reset player state
      setActiveVideo(null);
      setActiveSnippet(null);
      setShowPopup(false);
      setIsPlaying(false);
      setProgress(0);
      setTime(0);
      setDuration(0);
      setCurrentIndex(null);
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  // Open popup with selected track
  const openPopup = (videoId, snippet, index) => {
    setActiveVideo(videoId);
    setActiveSnippet(snippet);
    setCurrentIndex(index);
    setShowPopup(true);
    setProgress(0);
    setTime(0);
    setDuration(0);
    getAlbumCover();
    // console.log("Snippet : " , snippet);
    // console.log(playerRef.current)
    if(playerRef.current){
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
    }
  };

  // Close popup
  const closePopup = () => {
    setActiveVideo(null);
    setActiveSnippet(null);
    setShowPopup(false);
    setIsPlaying(false);
    setProgress(0);
    setTime(0);
    setDuration(0);
    setCurrentIndex(null);
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

  // Skip next/previous
  const skipNext = () => {
    if(isLooping){
      const current = results[currentIndex];
      openPopup(current.id.videoId, current.snippet , currentIndex);
    }
    else if (currentIndex === null || results.length === 0) return;
    else if (currentIndex < results.length - 1) {
      const nextIndex = currentIndex + 1;
      const next = results[nextIndex];
      openPopup(next.id.videoId, next.snippet, nextIndex);
    }
  };

  const skipPrevious = () => {
    if(isLooping){
      const current = results[currentIndex];
      openPopup(current.id.videoId , current.snippet , currentIndex);
    }
    else if (currentIndex === null || results.length === 0) return;
    else if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prev = results[prevIndex];
      openPopup(prev.id.videoId, prev.snippet, prevIndex);
    }
  };

  // Formatting helpers
  const formatTime = (seconds) => {
    const m = Math.floor((seconds || 0) / 60);
    const s = Math.floor(seconds || 0) % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleToggle = () => {
    if (!showFavs) {
      fetchFavourites(); // 👈 fetch only when opening
    }
    setShowFavs(!showFavs);
  };

  const [cover, setCover] = useState(null);

const getAlbumCover = async () => {
  try {
    const API_KEY = "654d2ea71fc1d8c133471f7a589c2c39";
    const query = inputRef.current.value;

    if (!query) return;

    // 1. Search track
    const searchRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(
        query
      )}&api_key=${API_KEY}&format=json`
    );
    const searchData = await searchRes.json();

    const track =
      searchData?.results?.trackmatches?.track?.[0];

    if (!track) {
      setCover(backupCover);
      return;
    }

    // 2. Get album info
    const infoRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&artist=${encodeURIComponent(
        track.artist
      )}&track=${encodeURIComponent(
        track.name
      )}&api_key=${API_KEY}&format=json`
    );
    const infoData = await infoRes.json();

    const images = infoData?.track?.album?.image;

const image = Array.isArray(images)
  ? images.find(i => i.size === "extralarge")?.["#text"]
  : null;

// get artist image from iTunes API
const artist = track.artist;

const artistRes = await fetch(
  `https://itunes.apple.com/search?term=${encodeURIComponent(
    artist
  )}&entity=musicArtist&limit=10`
);
const artistData = await artistRes.json();

const artistInfo = artistData?.results?.[0];

// iTunes returns 100x100, you can upgrade to 300x300
const artistImage = artistInfo?.artworkUrl100?.replace("100x100", "300x300") || null;

if (image) {
  setCover(image);
} else if (artistImage) {
  setCover(artistImage);
} else {
  setCover(backupCover);
}
  } catch (err) {
    console.log("Error:", err);
    setCover(backupCover);
  }
};
    const handleClear = ()=>{
        setResults([]);
        inputRef.current.value = null;
    }

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center items-center">
      {/* Main card */}
      <div className="bg-white max-w-md w-full rounded-xl shadow-lg p-10">
        <h2 className="text-center font-bold text-2xl text-black mb-4">
          MusicPlayer
        </h2>

        {/* Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            ref={inputRef}
            placeholder="Search Song..."
            className="w-full pl-4 pr-28 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
          />
          <button
            onClick={handleSearch}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-green-600 text-white px-5 py-1.5 rounded-full font-medium shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
          >
            Search
          </button>
        </div>
        <div className="p-4">
      <button
        onClick={handleToggle}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition ml-24"
      >
        {showFavs ? "Hide Favourites" : "Show Favourites"}
      </button>

      {showFavs && (
        <div className="mt-4">
          <ul className="space-y-4">
            {favourites.length === 0 ? (
              <p>No favourites yet.</p>
            ) : (
              favourites.map((fav, index) => (
                <li
                  key={fav.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={fav.thumbnail}
                      alt={fav.title}
                      className="w-20 h-20 rounded-lg shadow"
                    />
                    <div>
                      <p className="font-semibold">{fav.title}</p>
                      <p className="text-sm text-gray-500">{fav.channel}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openPopup(fav.videoId, fav, index)}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Play
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>

        {/* Results */}
        <ul className="mt-5 space-y-3">
          {results.map((video, index) => (
            <li
              key={video.id.videoId}
              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition"
              onClick={() => openPopup(video.id.videoId, video.snippet, index)}
            >
              <p className="font-semibold line-clamp-2">{video.snippet.title}</p>
              <p className="text-xs text-gray-500">{video.snippet.channelTitle}</p>
            </li>
          ))}
        </ul>

          <div className="flex justify-center items-center">
            <button className="px-6 py-2 rounded-lg text-white bg-blue-600 shadow hover:bg-blue-700 transition mt-5" onClick={handleClear}>Clear Results</button>
          </div>
      </div>

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
  <img
    src={cover}
    alt={activeSnippet?.title}
    className={`rounded-xl mb-4 shadow-lg w-52 h-52 object-cover ${
      isPlaying ? "animate-spin-slow" : ""
    }`}
  />

  {/* Title neatly centered */}
  <div className="w-full flex justify-center mb-1">
    <p className="font-bold text-lg text-center max-w-[90%] truncate">
      {activeSnippet?.title}
    </p>
  </div>

  <p className="text-sm text-gray-300 mb-4 text-center">
    {activeSnippet?.channelTitle}
  </p>

  {/* Controls row */}
  <div className="flex items-center justify-center space-x-6 mb-3">

    <button
  onClick={() => setIsLooping(!isLooping)}
  className={`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition cursor-pointer`}
  title="Repeat"
>
  {isLooping ? (<ArrowPathRoundedSquareIcon className="h-6 w-6 text-blue-500"/>) : (<ArrowPathIcon className="h-6 w-6 text-gray-500"/>)}
</button>
    {/* Backward */}
    <button
      onClick={skipPrevious}
      disabled={currentIndex === null || currentIndex <= 0}
      className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition ${
        currentIndex > 0
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
      disabled={currentIndex === null || currentIndex >= results.length - 1}
      className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition ${
        currentIndex !== null && currentIndex < results.length - 1
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-gray-800 text-gray-500 cursor-not-allowed"
      }`}
    >
      <ForwardIcon className="w-6 h-6" />
    </button>
    <button
  onClick={() => toggleFavourite(activeVideo, activeSnippet)}
  className={`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition ${
    favourites.find((fav) => fav.videoId === activeVideo)
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

  {/* Volume control with proper icon */}
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
  );
};

export default DashBoard;