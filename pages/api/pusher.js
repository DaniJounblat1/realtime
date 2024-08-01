// pages/api/pusher.js
import Pusher from "pusher";

const pusher = new Pusher({
    appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true
});

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { message } = req.body;
        await pusher.trigger("my-channel", "my-event", { message });
        res.status(200).end();
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
