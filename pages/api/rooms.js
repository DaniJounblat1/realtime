let rooms = [];

export default function handler(req, res) {
  if (req.method === "POST") {
    const { room } = req.body;
    rooms.push({ name: room });
    res.status(200).json({ message: "Room created" });
  } else if (req.method === "GET") {
    res.status(200).json({ rooms });
  }
}
