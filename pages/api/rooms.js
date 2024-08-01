// pages/api/rooms.js
let rooms = [];

export default function handler(req, res) {
    const { method } = req;

    if (method === "GET") {
        res.status(200).json(rooms);
    } else if (method === "POST") {
        const { room, password } = req.body;
        if (!rooms.find(r => r.name === room)) {
            rooms.push({ name: room, password });
            res.status(201).json({ message: "Room created" });
        } else {
            res.status(400).json({ message: "Room already exists" });
        }
    }
}
