import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import { generateLearningPath } from './huggingface';
import { db, ref, push, set, get, child } from './config/firebase';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

interface RoadmapEntry {
    topic: string;
    timestamp: number;
    result: any;
}

app.get('/', (req, res) => {
  res.send('Backend server is running. Use POST /api/learning-path to get a roadmap.');
});

app.post("/api/learning-path", async (req, res) => {
    const { topic } = req.body;

    if(!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const snapshot = await get(child(ref(db), 'roadmaps'));
        const data = snapshot.val() || {};
        const history = Object.values(data) as RoadmapEntry[];

        const topicExists = history.some(entry => entry.topic?.toLowerCase() === topic.toLowerCase());

       if (topicExists) {
            return res.status(409).json({ exists: true, message: "Topic already exists." });
        }

        const result = await generateLearningPath(topic);

        const roadmapRef = ref(db, 'roadmaps');
        const newEntry = push(roadmapRef);
        await set(newEntry, {
            topic,
            result,
            timestamp: Date.now(),
        });
        res.json({ roadmap: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate and save roadmap" });
    }
});

app.get("/api/history", async (req, res) => {
    try {
        const snapshot = await get(child(ref(db), 'roadmaps'));
        const data = snapshot.val() || {};
        res.json({ history: Object.values(data) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
