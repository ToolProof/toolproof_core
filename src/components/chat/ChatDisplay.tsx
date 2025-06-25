'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowDownCircleIcon } from '@heroicons/react/24/solid';
import MessageDisplay from './MessageDisplay';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setMessages } from '@/redux/features/messagesSlice';
import { ChatRead } from 'shared/src/typings';

// ***
import { RemoteGraph } from '@langchain/langgraph/remote';


const url = `https://baztest-490f0752e1d2559197a721cafbd3a375.us.langgraph.app`;
const apiKey = process.env.NEXT_PUBLIC_LANGCHAIN_API_KEY;
const ligandGraph = new RemoteGraph({ 
    graphId: 'graph', 
    url,
    apiKey
});
const config = { configurable: { thread_id: '5426f0ae-0abf-41ac-865b-6b1c7abf9056' } };
// ***

type Props = {
    chat: ChatRead;
}

export default function ChatDisplay({ chat }: Props) {
    const [componentMountTime, setComponentMountTime] = useState(new Date());
    const messageContainerRef = useRef<HTMLDivElement | null>(null);
    const messages = useAppSelector(state => state.messages.messages);
    const dispatch = useAppDispatch();


    useEffect(() => {

        const foo = async () => {
            const bar = await ligandGraph.getState(config);
            dispatch(setMessages(bar.values?.messages));
        };

        if (messages.length === 0) {
            foo();
        }

    }, [messages.length, dispatch]);


    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setComponentMountTime(new Date());
            }
        };

        // Add event listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []); // Empty dependency array ensures this runs only once on mount


    /* const isNewMessage = (messageTimestamp: FirebaseFirestore.Timestamp | null, index: number, arrayLength: number) => {

        // Check if it's the last message
        if (index !== arrayLength - 1) {
            return false;
        }

        if (!messageTimestamp || typeof messageTimestamp.toDate !== 'function') {
            // Handle the case where timestamp is null or not a Firestore Timestamp
            return false;
        }

        const messageCreationTime = messageTimestamp.toDate();
        const currentTime = new Date();
        const timeSinceMessageCreation = (currentTime.getTime() - messageCreationTime.getTime()) / 1000;
        const timeBetweenMessageCreationAndComponentMount = (messageCreationTime.getTime() - componentMountTime.getTime()) / 1000;

        return timeBetweenMessageCreationAndComponentMount > 0 && timeSinceMessageCreation < 30;
    }; */


    useEffect(() => {
        const scrollToBottom = () => {
            const messageContainer = messageContainerRef.current;
            if (messageContainer) {
                messageContainer.scrollTo({
                    top: messageContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        };

        setTimeout(scrollToBottom, 1000);

    }, [chat.id]);


    const handleTextChange = () => {
        const messageContainer = messageContainerRef.current;
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    };


    return (
        <div ref={messageContainerRef} className='max-h-[calc(80vh)] overflow-y-auto overflow-x-hidden bg-[#ffffff]'>
            {messages && messages.length === 0 && (
                <div>
                    <p className='mt-10 text-center text-black'>
                        Type a prompt to start a chat!
                    </p>
                    <ArrowDownCircleIcon className='h-10 w-10 mx-auto mt-5 text-black animate-bounce' />
                </div>
            )}
            {messages?.map((message, index) => {
                const isNew = false; // isNewMessage(message.timestamp, index, messages.length);
                //console.log('message', message.tags[0]);
                const messageComponent = <MessageDisplay
                    key={index}
                    message={message}
                    isNew={isNew}
                    onTextChange={handleTextChange}
                />
                return messageComponent;
            })}

        </div>
    );

}