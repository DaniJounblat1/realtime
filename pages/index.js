import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function Home() {
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [userJoined, setUserJoined] = useState(false);

    useEffect(() => {
        const socket = io();

        socket.on("userCount", count => {
            setOnlineUsers(count);
        });

        socket.on("userJoined", () => {
            setUserJoined(true);
            setTimeout(() => setUserJoined(false), 3000); // Hide the message after 3 seconds
        });

        return () => socket.disconnect();
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Online Users: {onlineUsers}</h1>
            {userJoined && <p>A new user has joined!</p>}
        </div>
    );
}
