import React from 'react'
import Logo from '../assets/Logo.png'

const AuthLayouts = ({children}) => {
  return (
    <>
        <header className='flex justify-center items-center py-3 h-20 shadow-md bg-white'>
          <img src={Logo} alt='' width={180} height={60} />
        </header>

        { children }
    </>
  )
}

export default AuthLayouts