const express = require("express");

const Conversation = require("../models/conversation");
const Message = require("../models/message");

module.exports.sendMessage_get = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.find({
      participants: { $all: [senderId, userToChatId] },
    });
    await conversation.populate('messages');// NOT REFERENCE BUT ACTUAL MESSAGES
  
    console.log(conversation);
		// if (!Conversation) return res.status(200).json([]);
   
		const messages = conversation.messages;
    console.log(messages);

		res.status(200).send(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports.sendMessage_post = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    //SOCKET.IO FUNCTIONALITY WILL GO HERE

    // await conversation.save();
    // await newMessage.save();

    //this will run in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
