import { useState, useEffect } from "react";
import Head from "next/head";


export default function Home() {
    const [rooms, setRooms] = useState([]);
    const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [password, setPassword] = useState("");
    const [joinPassword, setJoinPassword] = useState("");
    const [joinedRoom, setJoinedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [name, setName] = useState("");

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        const res = await fetch("/api/rooms");
        const data = await res.json();
        setRooms(data);
    };

    const createRoom = async e => {
        e.preventDefault();
        const res = await fetch("/api/rooms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ room: roomName, password })
        });
        const data = await res.json();
        if (res.status === 201) {
            alert(data.message);
            setShowCreateRoomForm(false);
            fetchRooms();
        } else {
            alert(data.message);
        }
    };

    const joinRoom = async (roomName, roomPassword) => {
        const res = await fetch("/api/joinRoom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ room: roomName, password: roomPassword })
        });
        const data = await res.json();
        if (res.status === 200) {
            setJoinedRoom(roomName);
            setMessages([]);
            fetchMessages(roomName);
        } else {
            alert(data.message);
        }
    };

    const fetchMessages = roomName => {
        // Fetch and set the messages for the room (implement the backend API if necessary)
    };

    const sendMessage = async e => {
        e.preventDefault();
        if (joinedRoom) {
            const newMessage = { name, message, room: joinedRoom };
            setMessages([...messages, newMessage]);
            setMessage("");
        }
    };

    return (
        <div className="container">
            <Head>
                <title>Chat Application</title>
            </Head>

            <h1>Welcome to the Chat App</h1>

            {joinedRoom ? (
                <>
                    <h2>Room: {joinedRoom}</h2>
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index}>
                                <strong>{msg.name}: </strong>
                                {msg.message}
                            </div>
                        ))}
                    </div>
                    <form onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name"
                            required
                        />
                        <input
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Enter your message"
                            required
                        />
                        <button type="submit">Send</button>
                    </form>
                </>
            ) : (
                <>
                    <button
                        onClick={() =>
                            setShowCreateRoomForm(!showCreateRoomForm)
                        }
                    >
                        {showCreateRoomForm ? "Cancel" : "Create Room"}
                    </button>

                    {showCreateRoomForm && (
                        <form onSubmit={createRoom}>
                            <input
                                type="text"
                                value={roomName}
                                onChange={e => setRoomName(e.target.value)}
                                placeholder="Enter room name"
                                required
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter room password (optional)"
                            />
                            <button type="submit">Create Room</button>
                        </form>
                    )}

                    <h2>Available Rooms:</h2>
                    <ul className="room-list">
                        {rooms.map(room => (
                            <li key={room.name} className="room-item">
                                {room.name}
                                {room.password && (
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        value={joinPassword}
                                        onChange={e =>
                                            setJoinPassword(e.target.value)
                                        }
                                    />
                                )}
                                <button
                                    onClick={() =>
                                        joinRoom(room.name, joinPassword)
                                    }
                                >
                                    Join
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
