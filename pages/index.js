import { useState, useEffect } from "react";
import Pusher from "pusher-js";

export default function Home() {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [target, setTarget] = useState(null);
    const [socketId, setSocketId] = useState(null);

    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
            authEndpoint: "/api/pusher",
            auth: { params: { name } }
        });

        pusher.connection.bind("connected", () => {
            setSocketId(pusher.connection.socket_id);
        });

        const channel = pusher.subscribe("presence-channel");

        channel.bind("user-joined", ({ users }) => {
            setUsers(users);
            if (users.length === 2) {
                const otherUser = users.find(user => user.name !== name);
                setTarget(otherUser.name);
            }
        });

        channel.bind("user-left", ({ users }) => {
            setUsers(users);
            if (users.length < 2) {
                setTarget(null);
            }
        });

        if (target) {
            const privateChannel = pusher.subscribe(`private-${target}`);
            privateChannel.bind("message", ({ name, message }) => {
                setMessages([...messages, { name, message }]);
            });
        }

        return () => {
            pusher.disconnect();
        };
    }, [name, target]);

    const handleSubmit = async e => {
        e.preventDefault();
        await fetch("/api/pusher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "message",
                name,
                message,
                target,
                socketId
            })
        });
        setMessages([...messages, { name, message }]);
        setMessage("");
    };

    const handleJoin = async e => {
        e.preventDefault();
        await fetch("/api/pusher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "join", name, socketId })
        });
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {!name ? (
                <form onSubmit={handleJoin}>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                    />
                    <button type="submit">Join</button>
                </form>
            ) : (
                <>
                    <h1>Chat with {target || "waiting for another user..."}</h1>
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
