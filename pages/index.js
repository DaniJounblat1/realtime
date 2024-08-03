import { useState, useEffect } from "react";
import Link from "next/link";

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
        const password = prompt(
            "Enter a password for the room (leave blank for no password):"
        );

        if (newRoom) {
            await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room: newRoom, password })
            });
            setRooms([...rooms, { name: newRoom, password: !!password }]);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <div>
                <h2>Available Rooms</h2>
                <ul>
                    {rooms.map((room, index) => (
                        <li key={index}>
                            <Link href={`/room?name=${room.name}`}>
                                {room.name} {room.password && "(Protected)"}
                            </Link>
                        </li>
                    ))}
                </ul>
                <button onClick={handleCreateRoom}>+ Create New Room</button>
            </div>
        </div>
    );
}
