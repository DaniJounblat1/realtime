import { useState, useEffect } from "react";
import Head from "next/head";
import io from "socket.io-client";

let socket;

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
    const [isNameSet, setIsNameSet] = useState(false);
    const [currentRoomToJoin, setCurrentRoomToJoin] = useState(null);

    useEffect(() => {
        fetchRooms();
        socketInitializer();
    }, []);

    const socketInitializer = async () => {
        await fetch("/api/socket");
        socket = io();

        socket.on("connect", () => {
            console.log("connected");
        });

        socket.on("receiveMessage", message => {
            setMessages(prevMessages => [...prevMessages, message]);
        });
    };

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
            socket.emit("joinRoom", { room: roomName });
        } else {
            alert(data.message);
        }
    };

    const sendMessage = async e => {
        e.preventDefault();
        if (joinedRoom) {
            const newMessage = { name, message, room: joinedRoom };
            socket.emit("sendMessage", newMessage);
            setMessages(prevMessages => [...prevMessages, newMessage]);
            setMessage("");
        }
    };

    const handleJoinClick = room => {
        const roomPassword = room.password
            ? prompt("Enter room password:")
            : "";
        if (!isNameSet) {
            const userName = prompt("Enter your name:");
            if (userName) {
                setName(userName);
                setIsNameSet(true);
                setCurrentRoomToJoin(room);
            }
        } else {
            joinRoom(room.name, roomPassword);
        }
    };

    useEffect(() => {
        if (isNameSet && currentRoomToJoin) {
            joinRoom(currentRoomToJoin.name, joinPassword);
            setCurrentRoomToJoin(null);
        }
    }, [isNameSet, currentRoomToJoin, joinPassword]);

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
                                <button onClick={() => handleJoinClick(room)}>
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
