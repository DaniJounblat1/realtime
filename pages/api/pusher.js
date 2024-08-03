import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

export default async function handler(req, res) {
  const { action, room, name, message, password } = req.body;

  if (action === "join") {
    const roomData = rooms.find(r => r.name === room);
    if (roomData.password && roomData.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    pusher.trigger(room, "user-joined", { name });
  } else if (action === "leave") {
    pusher.trigger(room, "user-left", { name });
  } else if (action === "message") {
    pusher.trigger(room, "message", { name, message });
  }

  res.status(200).json({ message: "Success" });
}
