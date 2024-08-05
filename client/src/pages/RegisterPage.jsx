import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    profile_pic: ''
  });

  const [uploadPhoto, setUploadPhoto] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()

  const fileInputRef = useRef(null);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadPhoto = await uploadFile(file);
    setUploadPhoto(file);

    setData((prev)=>{
      return{
        ...prev,
        profile_pic: uploadPhoto?.url
      }
    })
  };

  const handleClearUploadPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setUploadPhoto(null);
    fileInputRef.current.value = null;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/register`

    try {
      const response = await axios.post(URL,data)
      console.log('response:',response)
      toast.success(response.data.message)

      if(response.data.success){
        setData({
          name: '',
          email: '',
          password: '',
          profile_pic: ''
        })

        navigate('/email')
      }
      
    } catch (error) {
      toast.error(error?.response?.data?.message)
    }

    console.log('data', data);
  };

  return (
    <div className='mt-5'>
      <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto'>
        <h3>Welcome to Chat App!</h3>
        <form className='grid gap-4 mt-2' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='name'>Name:</label>
            <input
              type='text'
              id='name'
              name='name'
              placeholder='Enter your name'
              className='bg-slate-100 px-2 py-1 focus:outline-black'
              value={data.name}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='email'>Email:</label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Enter your email'
              className='bg-slate-100 px-2 py-1 focus:outline-black'
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

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
              required
            />
            <span
              className='absolute right-3 top-8 cursor-pointer'
              onClick={togglePasswordVisibility}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='profile_pic'>Photo:
              <div className='h-14 bg-slate-200 flex justify-center items-center border rounded hover:border-black cursor-pointer'>
                <p className='text-sm max-w-[300px] text-ellipsis line-clamp-1'>
                  {uploadPhoto?.name ? uploadPhoto?.name : 'Upload Profile Photo'}
                </p>
                {uploadPhoto?.name && (
                  <button className='text-lg ml-2 hover:text-red-600' onClick={handleClearUploadPhoto}>
                    <IoClose />
                  </button>
                )}
              </div>
            </label>
            <input
              type='file'
              id='profile_pic'
              name='profile_pic'
              className='bg-slate-100 px-2 py-1 focus:outline-black hidden'
              onChange={handleUploadPhoto}
              ref={fileInputRef}
            />
          </div>

          <button className='bg-black text-lg text-white px-4 py-1 hover:bg-gray-800 rounded mt-2 font-bold leading-relaxed tracking-wide'>
            Register
          </button>

        </form>
        <p className='my-3 text-center'>Already have an account? <Link to={'/email'} className='hover:text-gray-800 font-semibold'>Login</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
