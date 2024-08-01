import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true
});

let onlineUsers = 0;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action } = req.body;

    if (action === 'join') {
      onlineUsers++;
    } else if (action === 'leave') {
      onlineUsers = Math.max(0, onlineUsers - 1); // Prevent negative count
    }

    await pusher.trigger('my-channel', 'user-count', { onlineUsers });
    res.status(200).json({ onlineUsers });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
