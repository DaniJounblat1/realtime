import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true
});

let rooms = [];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { room, name, message, action, password } = req.body;

    const existingRoom = rooms.find(r => r.name === room);

    if (action === 'join') {
      if (existingRoom && existingRoom.password && existingRoom.password !== password) {
        return res.status(401).json({ status: 'fail', message: 'Incorrect password' });
      }
      await pusher.trigger(room, 'user-joined', { name });
    } else if (action === 'leave') {
      await pusher.trigger(room, 'user-left', { name });
    } else if (action === 'message') {
      await pusher.trigger(room, 'message', { name, message });
    }
    res.status(200).json({ status: 'success' });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
