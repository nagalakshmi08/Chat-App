import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {useDispatch} from 'react-redux'
import { setToken } from '../redux/userSlice';

const CheckPasswordPage = () => {
  const [data, setData] = useState({
    userId: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispath = useDispatch();
  console.log('location', location.state);

  useEffect(() => {
    if (!location?.state?.name) {
      navigate('/email');
    } else {
      setData((prev) => ({
        ...prev,
        userId: location.state._id
      }));
    }
  }, [location, navigate]);
  

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev)=>{
      return{
          ...prev,
          [name] : value
      }
    })
  }

  const handleFocus = () => {
    setIsPasswordFocused(true);
  };

  const handleBlur = () => {
    setIsPasswordFocused(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!data.password) {
      toast.error('Password is required');
      return;
    }

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/password`;

    try {
      const response = await axios({
        method : 'post',
        url: URL,
        data:{
          userId:location?.state?._id,
          password:data.password
        },
        withCredentials:true
      })
      toast.success(response.data.message);

      if (response.data.success) {
        dispath(setToken(response?.data?.token))
        localStorage.setItem('token',response?.data?.token)
        setData({
          password: ''
        });

        navigate('/');
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      toast.error(error?.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className='mt-5'>
      <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto'>
        <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
          <Avatar
            width={75}
            height={75}
            name={location?.state?.name}
            imageUrl={location?.state?.profile_pic}
          />
          <h2 className='font-semibold text-lg mt-1'>{location?.state?.name}</h2>
        </div>

        <form className='grid gap-4 mt-2' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1 relative'>
            <label htmlFor='password'>Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id='password'
              name='password'
              placeholder='Enter your password'
              className='bg-slate-100 px-2 py-1 focus:outline-black'
              value={data.password}
              onChange={handleOnChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />

            {(isPasswordFocused || data.password) && (
              <span
                className='absolute right-3 top-8 cursor-pointer'
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            )}
          </div>

          <button className='bg-black text-lg text-white px-4 py-1 hover:bg-gray-800 rounded mt-2 font-bold leading-relaxed tracking-wide'>
            Login
          </button>
        </form>
        <p className='my-3 text-center'>
          <Link to={'/forgot-password'} className='hover:text-gray-800 font-semibold'>
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CheckPasswordPage;
