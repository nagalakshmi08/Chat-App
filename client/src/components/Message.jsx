import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import Avatar from './Avatar'
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import uploadFile from '../helpers/uploadFile';
import { IoClose } from "react-icons/io5";
import Loading from './Loading'
import backgroundImage from '../assets/Background.jpg'
import { IoSend } from "react-icons/io5";
import moment from 'moment'

const Message = () => {
  const params = useParams()
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const user = useSelector(state=>state?.user)
  const [dataUser, setDataUser] = useState({
    name: '',
    email: '',
    profile_pic: '',
    online: false,
    _id:''
  })
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false)
  const [message,setMessage] = useState({
    text: '',
    imageUrl : '',
    videoUrl : ''
  })
  const [loading, setLoading] = useState(false)
  const [allMessages, setAllMessages] = useState([])
  const currentMessage = useRef(null)

  useEffect(()=>{
    if(currentMessage.current){
      currentMessage.current.scrollIntoView({behaviour : 'smooth', block : 'end'})
    }
  },[allMessages])

  const handleUploadImageVideoOpen = () =>{
    setOpenImageVideoUpload(prev => !prev)
  }

  const handleUploadImage = async(e) =>{
    const file = e.target.files[0];
    setLoading(true)
    const uploadPhoto = await uploadFile(file);
    setLoading(false)
    setOpenImageVideoUpload(false)
    setMessage(prev => {
      return{
        ...prev,
        imageUrl : uploadPhoto.url
      }
    })
  }

  const handleClearUploadImage = () =>{
    setMessage(prev => {
      return{
        ...prev,
        imageUrl : ''
      }
    })
  }

  const handleUploadVideo = async(e) =>{
    const file = e.target.files[0];
    setLoading(true)
    const uploadPhoto = await uploadFile(file);
    setLoading(false)
    setOpenImageVideoUpload(false)
    setMessage(prev => {
      return{
        ...prev,
        videoUrl : uploadPhoto.url
      }
    })
  }

  const handleClearUploadVideo = () =>{
    setMessage(prev => {
      return{
        ...prev,
        videoUrl : ''
      }
    })
  }

  useEffect(() => {
    console.log('params:', params)
    console.log('socketConnection:', socketConnection)

    if (socketConnection) {
      console.log('Socket connection is established')
      if (params.userId) {
        socketConnection.emit('message-page', params.userId)
        console.log('Emitted message-page event with userId:', params.userId)
      } else {
        console.error('params.userId is not defined')
      }

      socketConnection.emit('seen',params.userId)

      socketConnection.on('message-user', (data) => {
        setDataUser(data)
      })

      socketConnection.on('message',(data)=>{
        console.log('message data',data)
        setAllMessages(data)
      })


    }
  }, [socketConnection, params?.userId,user])

  const handleOnChange = (e) =>{
    const {name, value} = e.target
    setMessage(prev => {
      return{
        ...prev,
        text : value
      }
    })
  }

  const handleSendMessage = (e) =>{
    e.preventDefault()
    if(message.text || message.imageUrl || message.videoUrl){
      if(socketConnection){
        socketConnection.emit('new message',{
          sender : user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id
        })
        setMessage({
          text: '',
          imageUrl : '',
          videoUrl : ''
        })
      }
    }
  }


  return (
    <div style={{backgroundImage : `url(${backgroundImage})`}}>
        <header className='sticky top-0 h-16 bg-white flex items-center justify-between px-4'>
          <div className='flex items-center gap-4'>
            <Link to={'/'} className='lg:hidden'>
              <FaAngleLeft size={25} />
            </Link>
            <div>
              <Avatar
                width={50}
                height={50}
                imageUrl={dataUser?.profile_pic}
                name={dataUser?.name}
                userId={dataUser?._id}
               />
            </div>
            <div className='mb-2'>
              <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
              <p className='-my-2 text-sm'>
                {
                  dataUser.online ? <span className='text-green-400'>online</span> : <span className='text-slate-400'>offline</span>
                }
              </p>
            </div>
          </div>
          <div>
            <button className='curosr-pointer hover:text-gray-800'>
              <HiOutlineDotsVertical />
            </button>
          </div>
        </header>

        {/* show all messages */}
        <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-40'>

          {/* All messages displayed here */}
          <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
            {
              allMessages.map((msg,index)=>{
                return(
                  <div className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user._id === msg.msgByUserId ? 'ml-auto bg-teal-100' : 'bg-white'}`}>
                    <div className='w-full'>
                      {
                        msg?.imageUrl && (
                          <img
                            src={msg?.imageUrl}
                            className='w-full h-full object-scale-down'
                          />
                        )
                      }

                      {
                        msg?.videoUrl && (
                          <video
                            src={msg?.videoUrl}
                            className='w-full h-full object-scale-down'
                            controls
                          />
                        )
                      }
                    </div>
                    <p className='px-2'>{msg.text}</p>
                    <p className='text-xs ml-auto w-fit'>{moment(msg.createdAt).format('hh:mm')}</p>
                  </div>
                )
              })
            }
          </div>

                      {/* upload image display */}
          {
            message.imageUrl && (
              <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
                <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer text-black hover:text-red-600' onClick={handleClearUploadImage}> 
                  <IoClose size={30} />
                </div>
                <div className='bg-white p-3'>
                  <img 
                  src={message.imageUrl} 
                  alt='Upload image'
                  className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                  />
                </div>
              </div>
            )
          }


          {/* upload video display */}
          {
            message.videoUrl && (
              <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
                <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer text-black hover:text-red-600' onClick={handleClearUploadVideo}> 
                  <IoClose size={30} />
                </div>
                <div className='bg-white p-3'>
                  <video 
                  src={message.videoUrl}  
                  className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                  controls
                  muted
                  autoPlay
                  />
                </div>
              </div>
            )
          }

          {
            loading && (
                <div className='w-full h-full flex sticky bottom-0 items-center justify-center'>
                  <Loading />
                </div>
            )
          }

        </section>
        
        {/* send message */}
        <section className='h-16 bg-white flex items-center px-4'>
          <div className='relative'>
            <button onClick={handleUploadImageVideoOpen} className='flex justify-center items-center w-11 h-11 rounded-full hover:bg-black hover:text-white cursor-pointer'>
              <FaPlus size={20} />
            </button>

            {/* video and image */}
            {
              openImageVideoUpload && (
                <div className='bg-white shadow rounded absolute bottom-14 w-36 p-2'>
                  <form>
                    <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3  hover:bg-slate-200 cursor-pointer'>
                      <div className='text-teal-500'>
                        <FaImage size={18} />
                      </div>
                      <p>Image</p>
                    </label>

                    <label htmlFor='uploadVideo' className='flex items-center p-2 px-2 gap-3 hover:bg-slate-200 cursor-pointer'>
                      <div className='text-purple-500'>
                        <FaVideo size={18} />
                      </div>
                      <p>Video</p>
                    </label>

                    <input
                      type='file' 
                      id='uploadImage'
                      onChange={handleUploadImage}
                      className='hidden'
                     />

                    <input
                      type='file' 
                      id='uploadVideo'
                      onChange={handleUploadVideo}
                       className='hidden'
                     />

                  </form>
                </div>
              )
            }
          </div>

        {/* input box */}
        <form className='h-full w-full flex gap-2' onSubmit={handleSendMessage}>
            <input 
              type='text'
              placeholder='Type here message...'
              className='py-1 px-4 outline-none w-full h-full'
              value={message.text}
              onChange={handleOnChange}
            />
            <button className='hover:text-gray-800'>
              <IoSend size={28} />
            </button>
        </form>
        </section>

    </div>
  )
}

export default Message
