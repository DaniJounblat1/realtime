let rooms = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(rooms);
  } else if (req.method === 'POST') {
    const { room, password } = req.body;
    const newRoom = { name: room, password, messages: [] };
    rooms.push(newRoom);
    res.status(201).json({ message: 'Room created successfully' });
  }
}

export { rooms };
