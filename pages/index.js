// pages/index.js
import { useState, useEffect } from 'react';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const res = await fetch('/api/rooms');
    const data = await res.json();
    setRooms(data);
  };

  const createRoom = async () => {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room: roomName, password }),
    });
    const data = await res.json();
    if (res.status === 201) {
      alert(data.message);
      fetchRooms();
    } else {
      alert(data.message);
    }
  };

  const handleJoinRoom = async (roomName, roomPassword) => {
    // Implement joining room logic here
  };

  return (
    <div className="container">
      <h1>Welcome to the Chat App</h1>

      {/* Room creation form */}
      <form onSubmit={createRoom}>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter room password (optional)"
        />
        <button type="submit">Create Room</button>
      </form>

      {/* List of available rooms */}
      <h2>Available Rooms:</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.name}>
            {room.name}
            {room.password && <span> (Password protected)</span>}
            <button onClick={() => handleJoinRoom(room.name)}>Join</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
