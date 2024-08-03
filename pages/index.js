import { useState, useEffect } from "react";
import Link from 'next/link';


export default function Home() {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        // Fetch available rooms when the component mounts
        fetch("/api/rooms")
            .then(response => response.json())
            .then(data => setRooms(data.rooms));
    }, []);

    const handleCreateRoom = async () => {
        const newRoom = prompt("Enter new room name:");
        if (newRoom) {
            await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room: newRoom })
            });
            setRooms([...rooms, newRoom]);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <div>
                <h2>Available Rooms</h2>
                <ul>
                    {rooms.map((room, index) => (
                        <li key={index}>
                            <Link href={`/room?name=${room}`}>{room}</Link>
                        </li>
                    ))}
                </ul>
                <button onClick={handleCreateRoom}>+ Create New Room</button>
            </div>
        </div>
    );
}
