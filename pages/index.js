import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

export default function Home() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [userJoined, setUserJoined] = useState(false);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe('my-channel');

    channel.bind('my-event', (data) => {
      setOnlineUsers(data.onlineUsers);
      setUserJoined(true);
      setTimeout(() => setUserJoined(false), 3000);
    });

    // Emit event on join
    fetch('/api/pusher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'User joined' }),
    });

    return () => {
      pusher.unsubscribe('my-channel');
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Online Users: {onlineUsers}</h1>
      {userJoined && <p>A new user has joined!</p>}
    </div>
  );
}
