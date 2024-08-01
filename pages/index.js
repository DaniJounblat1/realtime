import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import styles from "../styles/Home.module.scss";

export default function Home() {
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        if (joined) {
            const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
            });

            const channel = pusher.subscribe(room);

            // Retrieve messages from local storage
            const storedMessages =
                JSON.parse(localStorage.getItem(`chat_${room}`)) || [];
            setMessages(storedMessages);

            channel.bind("message", data => {
                const newMessage = {
                    name: data.name,
                    message: data.message,
                    image: data.image
                };
                setMessages(prevMessages => [...prevMessages, newMessage]);

                // Save messages to local storage
                localStorage.setItem(
                    `chat_${room}`,
                    JSON.stringify([...prevMessages, newMessage])
                );
            });

            channel.bind("user-joined", data => {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { name: data.name, message: "joined the room" }
                ]);
            });

            channel.bind("user-left", data => {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { name: data.name, message: "left the room" }
                ]);
            });

            return () => {
                pusher.unsubscribe(room);
            };
        }
    }, [joined, room]);

    const handleJoin = async e => {
        e.preventDefault();
        await fetch("/api/pusher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "join", room, name })
        });
        setJoined(true);
    };

    const handleLeave = async () => {
        await fetch("/api/pusher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "leave", room, name })
        });
        setJoined(false);
        setRoom("");
        setName("");
        setMessages([]);
        localStorage.removeItem(`chat_${room}`);
    };

    const handleImageChange = e => {
        const file = e.target.files[0];
        setImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async e => {
        e.preventDefault();

        let imageUrl = null;
        if (image) {
            const formData = new FormData();
            formData.append("file", image);
            formData.append("upload_preset", "your_upload_preset");

            const response = await fetch(
                "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();
            imageUrl = data.secure_url;
        }

        await fetch("/api/pusher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "message",
                room,
                name,
                message,
                image: imageUrl
            })
        });

        const newMessage = { name, message, image: imageUrl };
        setMessages([...messages, newMessage]);

        // Save messages to local storage
        localStorage.setItem(
            `chat_${room}`,
            JSON.stringify([...messages, newMessage])
        );

        setMessage("");
        setImage(null);
        setImagePreview(null);
    };

    return (
        <div className={styles.container}>
            {!joined ? (
                <form className={styles.form} onSubmit={handleJoin}>
                    <input
                        type="text"
                        className={styles.input}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                    />
                    <input
                        type="text"
                        className={styles.input}
                        value={room}
                        onChange={e => setRoom(e.target.value)}
                        placeholder="Enter room name"
                        required
                    />
                    <button type="submit" className={styles.button}>
                        Join
                    </button>
                </form>
            ) : (
                <>
                    <h1>Room: {room}</h1>
                    <button className={styles.button} onClick={handleLeave}>
                        Leave Room
                    </button>
                    <div className={styles.messageContainer}>
                        {messages.map((msg, index) => (
                            <div key={index} className={styles.message}>
                                <strong>{msg.name}:</strong> {msg.message}
                                {msg.image && (
                                    <img
                                        src={msg.image}
                                        alt="Image"
                                        className={styles.imagePreview}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className={styles.input}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Enter your message"
                            required
                        />
                        <input
                            type="file"
                            className={styles.input}
                            onChange={handleImageChange}
                        />
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className={styles.imagePreview}
                            />
                        )}
                        <button type="submit" className={styles.button}>
                            Send
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
