import { useState, useEffect } from "react";
import Pusher from "pusher-js";


export default function Home() {
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [joined, setJoined] = useState(false);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const res = await fetch("/api/rooms");
            const data = await res.json();
            setRooms(data.rooms);
        };

        fetchRooms();

        if (joined) {
            const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
            });

            const channel = pusher.subscribe(room);

            channel.bind("message", data => {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { name: data.name, message: data.message }
                ]);
            });

            channel.bind("user-joined", data => {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { name: data.name, message: "joined the room" }
                ]);
            });

            channel.bind("user-left", data => {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { name: data.name, message: "left the room" }
                ]);
            });

            return () => {
                pusher.unsubscribe(room);
            };
        }
    }, [joined, room]);

    const handleJoin = async e => {
        e.preventDefault();
        await fetch("/api/pusher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "join", room, name })
        });
        setJoined(true);
    };

    const handleLeave = async () => {
        await fetch("/api/pusher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "leave", room, name })
        });
        setJoined(false);
        setRoom("");
        setName("");
        setMessages([]);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        await fetch("/api/pusher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "message", room, name, message })
        });
        setMessage("");
    };

    const createRoom = async () => {
        const roomName = prompt("Enter room name:");

        await fetch("/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ room: roomName })
        });

        const res = await fetch("/api/rooms");
        const data = await res.json();
        setRooms(data.rooms);
    };

    return (
        <div className="container">
            {!name ? (
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        setName(name);
                    }}
                >
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                    />
                    <button type="submit">Set Name</button>
                </form>
            ) : !joined ? (
                <>
                    <button onClick={createRoom}>Create Room</button>
                    <ul>
                        {rooms.map((r, index) => (
                            <li key={index}>
                                {r.name}
                                <button
                                    onClick={() => {
                                        setRoom(r.name);
                                        handleJoin();
                                    }}
                                >
                                    Join
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <>
                    <h1>Room: {room}</h1>
                    <button onClick={handleLeave}>Leave Room</button>
                    <ul>
                        {messages.map((msg, index) => (
                            <li key={index}>
                                <strong>{msg.name}:</strong> {msg.message}
                            </li>
                        ))}
                    </ul>
                    <form onSubmit={handleSubmit}>
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
            )}
        </div>
    );
}
