// pages/index.js
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

export default function Home() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [rooms, setRooms] = useState([]);
  const [password, setPassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => setRooms(data));
  }, []);

  useEffect(() => {
    if (joined) {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });

      const channel = pusher.subscribe(room);

      const storedMessages = JSON.parse(localStorage.getItem(`chat_${room}`)) || [];
      setMessages(storedMessages);

      channel.bind('message', (data) => {
        const newMessage = { name: data.name, message: data.message, image: data.image };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        localStorage.setItem(`chat_${room}`, JSON.stringify([...prevMessages, newMessage]));
      });

      channel.bind('user-joined', (data) => {
        setMessages((prevMessages) => [...prevMessages, { name: data.name, message: 'joined the room' }]);
      });

      channel.bind('user-left', (data) => {
        setMessages((prevMessages) => [...prevMessages, { name: data.name, message: 'left the room' }]);
      });

      return () => {
        pusher.unsubscribe(room);
      };
    }
  }, [joined, room]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, password }),
    });
    const data = await response.json();
    if (data.message === 'Room created') {
      setRooms([...rooms, { name: room, password }]);
    } else {
      alert(data.message);
    }
  };

  const handleJoinRoom = async (roomName, roomPassword) => {
    const response = await fetch('/api/joinRoom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: roomName, password: roomPassword }),
    });
    const data = await response.json();
    if (data.message === 'Joined room') {
      setRoom(roomName);
      setJoined(true);
    } else {
      alert(data.message);
    }
  };

  const handleLeave = async () => {
    await fetch('/api/pusher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'leave', room, name }),
    });
    setJoined(false);
    setRoom('');
    setName('');
    setMessages([]);
    localStorage.removeItem(`chat_${room}`);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = null;
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', 'your_upload_preset');

      const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      imageUrl = data.secure_url;
    }

    await fetch('/api/pusher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'message', room, name, message, image: imageUrl }),
    });

    const newMessage = { name, message, image: imageUrl };
    setMessages([...messages, newMessage]);
    localStorage.setItem(`chat_${room}`, JSON.stringify([...messages, newMessage]));
    setMessage('');
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="container">
      {!joined ? (
        <>
          <form className="form" onSubmit={handleCreateRoom}>
            <input
              type="text"
              className="input"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room name"
              required
            />
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter room password (optional)"
            />
            <button type="submit" className="button">Create Room</button>
          </form>

          <h2>Available Rooms</h2>
          <ul className="room-list">
            {rooms.map((r) => (
              <li key={r.name} className="room-item">
                {r.name}
                {r.password && (
                  <input
                    type="password"
                    className="input"
                    placeholder="Enter password"
                    onChange={(e) => setJoinPassword(e.target.value)}
                  />
                )}
                <button
                  className="button"
                  onClick={() => handleJoinRoom(r.name, joinPassword)}
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
          <button className="button" onClick={handleLeave}>Leave Room</button>
          <div className="message-container">
            {messages.map((msg, index) => (
              <div key={index} className="message">
                <strong>{msg.name}:</strong> {msg.message}
                {msg.image && <img src={msg.image} alt="Image" className="image-preview" />}
              </div>
            ))}
          </div>
          <form className="form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              required
            />
            <input
              type="file"
              className="input"
              onChange={handleImageChange}
            />
            {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
            <button type="submit" className="button">Send</button>
          </form>
        </>
      )}
    </div>
  );
}
