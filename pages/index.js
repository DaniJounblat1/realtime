import { useState, useEffect } from "react";
import Pusher from "pusher-js";

export default function Home() {
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
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

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {!joined ? (
                <form onSubmit={handleJoin}>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                    />
                    <input
                        type="text"
                        value={room}
                        onChange={e => setRoom(e.target.value)}
                        placeholder="Enter room name"
                        required
                    />
                    <button type="submit">Join</button>
                </form>
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
