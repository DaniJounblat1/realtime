// pages/api/joinRoom.js
export default function handler(req, res) {
    const { room, password } = req.body;

    const existingRoom = rooms.find(r => r.name === room);
    if (existingRoom) {
        if (!existingRoom.password || existingRoom.password === password) {
            res.status(200).json({ message: "Joined room" });
        } else {
            res.status(401).json({ message: "Incorrect password" });
        }
    } else {
        res.status(404).json({ message: "Room not found" });
    }
}
