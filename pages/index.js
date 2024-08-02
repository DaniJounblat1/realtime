import { useState, useEffect } from "react";
import Head from "next/head";
import io from "socket.io-client";


let socket;

export default function Home() {
    const [room, setRoom] = useState("");
    const [name, setName] = useState("");
    const [joined, setJoined] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket = io({
            path: "/api/socket"
        });

        socket.on("receiveMessage", message => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const joinRoom = () => {
        if (room && name) {
            socket.emit("joinRoom", { room, name });
            setJoined(true);
        }
    };

    const sendMessage = () => {
        if (message) {
            const msg = { name, text: message };
            socket.emit("sendMessage", { room, message: msg });
            setMessages(prevMessages => [...prevMessages, msg]);
            setMessage("");
        }
    };

    return (
        <div className="container">
            <Head>
                <title>Chat Application</title>
            </Head>

            {!joined ? (
                <div className="joinRoomContainer">
                    <h1>Join a Room</h1>
                    <input
                        type="text"
                        placeholder="Room Name"
                        value={room}
                        onChange={e => setRoom(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <button onClick={joinRoom}>Join Room</button>
                </div>
            ) : (
                <div className="chatContainer">
                    <h1>Room: {room}</h1>
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index}>
                                <strong>{msg.name}: </strong>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Enter your message"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            )}
        </div>
    );
}
