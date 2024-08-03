let rooms = [];

export default function handler(req, res) {
    if (req.method === 'GET') {
        res.status(200).json({ rooms });
    } else if (req.method === 'POST') {
        const { room, password } = req.body;
        if (room && !rooms.some(r => r.name === room)) {
            rooms.push({ name: room, password });
            res.status(201).json({ status: 'Room created' });
        } else {
            res.status(400).json({ status: 'Room already exists' });
        }
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
