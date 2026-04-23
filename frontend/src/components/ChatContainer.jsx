import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton'
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';

const ChatContainer = () => {
  const messageEndRef =useRef(null)
  const { messages, getMessages, isMessagesLoading, selectedUser ,subscribeToMessages,unSubscribeToMessages} = useChatStore();
  const {authUser} = useAuthStore()

  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id);
    subscribeToMessages()
    return () => unSubscribeToMessages();
  }, [selectedUser, getMessages, unSubscribeToMessages, subscribeToMessages]);
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({behavior:"smooth"})
    }
  },[messages])
  if (isMessagesLoading) return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />
      <MessageSkeleton />
      <MessageInput/>
    </div>
  )
  return (
    <div className='flex-1 flex flex-col overflow-auto'>

      <ChatHeader />
      <div className='flex-1 overflow-y-auto p-4 space-y-4 '>
        {messages.map((message, index) => {
          const currentDate = new Date(message.createdAt).toDateString();
          const prevDate =
            index > 0
              ? new Date(messages[index - 1].createdAt).toDateString()
              : null;

          const showDateSeparator = currentDate !== prevDate;

          return (
            <React.Fragment key={message._id}>
              {showDateSeparator && (
                <div className="text-center my-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-base-200 text-gray-500">
                    {currentDate}
                  </span>
                </div>
              )}

              <div
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
                ref={index === messages.length - 1 ? messageEndRef : null}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>

                <div className="chat-header mb-1">
                  <time className="text-sm opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>

                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-50 rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <MessageInput/>
    </div>
  )
}

export default ChatContainer
