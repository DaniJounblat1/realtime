let rooms = [];

export default function handler(req, res) {
  if (req.method === "POST") {
    const { room, password } = req.body;
    rooms.push({ name: room, password });
    res.status(200).json({ message: "Room created" });
  } else if (req.method === "GET") {
    res.status(200).json({ rooms });
  }
}
