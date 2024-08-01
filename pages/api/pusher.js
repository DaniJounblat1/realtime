import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true
});

const users = [];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, message, action } = req.body;

    if (action === 'join') {
      users.push({ name, socketId: req.body.socketId });
      pusher.trigger('presence-channel', 'user-joined', { users });
    } else if (action === 'leave') {
      const index = users.findIndex(user => user.name === name);
      if (index !== -1) {
        users.splice(index, 1);
        pusher.trigger('presence-channel', 'user-left', { users });
      }
    } else if (action === 'message') {
      pusher.trigger(`private-${req.body.target}`, 'message', { name, message });
    }
    res.status(200).json({ status: 'success' });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
