const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation.js');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

const onlineUser = new Set();

io.on('connection', async (socket) => {
  console.log('Connected user:', socket.id);

  const token = socket.handshake.auth.token;
  if (!token) {
    console.error('Token is missing in socket handshake');
    socket.disconnect();
    return;
  }

  try {
    const user = await getUserDetailFromToken(token);
    if (!user || !user._id) {
      console.error('User not found from token');
      socket.disconnect();
      return;
    }
    
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());
    io.emit('onlineUser', Array.from(onlineUser));

    socket.on('message-page', async (userId) => {
      try {
        console.log('Received userId on server:', userId);
        const userDetails = await UserModel.findById(userId).select('-password');
        if (!userDetails) {
          console.error('User not found for userId:', userId);
          return;
        }

        const payload = {
          _id: userDetails._id,
          name: userDetails.name,
          email: userDetails.email,
          profile_pic: userDetails.profile_pic,
          online: onlineUser.has(userId)
        };

        socket.emit('message-user', payload);

        const getConversationMessage = await ConversationModel.findOne({
          '$or': [
            { sender: user._id, receiver: userId },
            { sender: userId, receiver: user._id }
          ]
        }).populate('messages').sort({ updatedAt: -1 });

        socket.emit('message', getConversationMessage?.messages || []);

      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    });

    socket.on('new message', async (data) => {
      try {
        let conversation = await ConversationModel.findOne({
          '$or': [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender }
          ]
        });

        if (!conversation) {
          const createConversation = new ConversationModel({
            sender: data.sender,
            receiver: data.receiver
          });
          conversation = await createConversation.save();
        }

        const message = new MessageModel({
          text: data.text,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          msgByUserId: data.msgByUserId
        });
        const saveMessage = await message.save();

        await ConversationModel.updateOne(
          { _id: conversation._id },
          { '$push': { messages: saveMessage._id } }
        );

        const getConversationMessage = await ConversationModel.findOne({
          '$or': [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender }
          ]
        }).populate('messages').sort({ updatedAt: -1 });

        io.to(data?.sender).emit('message', getConversationMessage.messages);
        io.to(data?.receiver).emit('message', getConversationMessage.messages);

        const conversationSender = await getConversation(data?.sender);
        const conversationReceiver = await getConversation(data?.receiver);

        io.to(data?.sender).emit('conversation', conversationSender);
        io.to(data?.receiver).emit('conversation', conversationReceiver);

      } catch (error) {
        console.error('Error handling new message:', error);
      }
    });

    socket.on('sidebar', async (currentUserId) => {
      try {
        console.log('Current user id:', currentUserId);
        const conversation = await getConversation(currentUserId);
        socket.emit('conversation', conversation);
      } catch (error) {
        console.error('Error fetching sidebar conversations:', error);
      }
    });

    socket.on('seen', async (msgByUserId) => {
      try {
        let conversation = await ConversationModel.findOne({
          '$or': [
            { sender: user?._id, receiver: msgByUserId },
            { sender: msgByUserId, receiver: user?._id }
          ]
        });

        const conversationMessageId = conversation?.messages || [];

        await MessageModel.updateMany(
          { _id: { '$in': conversationMessageId }, msgByUserId: msgByUserId },
          { '$set': { seen: true } }
        );

        const conversationSender = await getConversation(user?._id.toString());
        const conversationReceiver = await getConversation(msgByUserId);

        io.to(user?._id.toString()).emit('conversation', conversationSender);
        io.to(msgByUserId).emit('conversation', conversationReceiver);

      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    });

    socket.on('disconnect', () => {
      onlineUser.delete(user._id.toString());
      console.log('Disconnected user:', socket.id);
    });

  } catch (error) {
    console.error('Authentication error:', error);
    socket.disconnect();
  }
});

module.exports = {
  app,
  server
};
