import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <div>
      <Link className='text-2xl text-blue-600 font-bold text-center' to={"/signup"}>GOTO Signup</Link>
      
    </div>
  )
}

export default Login
