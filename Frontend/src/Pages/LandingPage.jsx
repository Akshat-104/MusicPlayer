import React from 'react'
import logo from "../../images/Spotify_logo_without_text.svg.png"
import logo2 from "../../images/music-2.png"
import { useNavigate } from 'react-router-dom'
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-neutral-900 flex items-center justify-center'>
      {/* Card */}
      <div className='w-full shadow-lg max-w-md bg-neutral-900 rounded-lg p-8'>
        <img src={logo} className='w-9 h-9 mx-auto mb-5'></img>
        <h2 className='text-center font-bold text-2xl text-white'>MusicPlayer</h2>
        <p className='text-lg text-gray-300 mt-2 text-center'>Start listening to your favourite songs it's just a click away</p>
        <div className='flex justify-around'>
          <button className='cursor-pointer px-6 py-2 bg-zinc-100 p-2 mt-5 rounded-lg font-bold' onClick={()=>{navigate("/signup")}}>Signup</button>
          <button className='cursor-pointer px-6 py-2 bg-zinc-100 p-2 mt-5 rounded-lg font-bold' onClick={()=>{navigate("login")}}>Login</button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
