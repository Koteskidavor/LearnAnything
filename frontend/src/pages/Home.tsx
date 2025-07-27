import { useState } from 'react';
import { RoadmapCanvas } from '../components/RoadmapCanvas';
import styles from '../styles/Home.module.css';

export default function Home() {
    const [topic, setTopic] = useState("");
    const [data, setData] = useState<any>(null);   
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showFlow, setShowFlow] = useState(false);

    const fetchRoadmap = async () => {
        if (!topic.trim()) return;

        setLoading(true);
        setError("");
        setData(null);

        try {
            const response = await fetch("http://localhost:4000/api/learning-path", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unknown error occurred.");
            }
            console.log(result);
            setData(result);
            setShowFlow(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <section className={styles.container}>
            <h1 className={styles.title}>Learn‑Anything Pathway Generator</h1>
            <p className={styles.subtitle}>
                Type a topic and get a personalized roadmap with key concepts and resources.
            </p>

            <div className={styles.form}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="e.g. Machine Learning"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
                <button
                    className={styles.button}
                    onClick={fetchRoadmap}
                    disabled={!topic.trim() || loading}
                >
                    {loading ? "Loading..." : "Create Pathway"}
                </button>
            </div>

            {error && <p className={styles.error}>❌ {error}</p>}

            {data && (
                <>
                    <div className={styles.resourcesPreview}>
                        <h2>🔗 Recommended Resources</h2>
                        <ul className={styles.resourceList}>
                            {data.resources}
                        </ul>
                    </div>
                    
                    <div className={styles.roadmapContainer}>
                        <h2 className={styles.roadmapTitle}>📘 Roadmap</h2>
                        <ul className={styles.roadmapList}>
                            {data.roadmap.resources?.map((step: any, idx: number) => (
                                <li key={idx} className={styles.resourceCard}>
                                    <p className={styles.resourceTitle}>{step.text}</p>
                                    <div className={styles.linkGroup}>
                                        <a className={styles.linkButton} href={step.google} target="_blank" rel="noopener noreferrer">🔍 Google</a>
                                        <a className={styles.linkButton} href={step.youtube} target="_blank" rel="noopener noreferrer">📺 YouTube</a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className={styles.previewNote}>👇 These are just previews — see full roadmap below 👇</p>
                    </div>
        

                    <button
                        className={styles.toggleFlow}
                        onClick={() => setShowFlow((prev) => !prev)}
                    >
                        {showFlow ? "Hide Visual Roadmap" : "🧠 Visualize Roadmap"}
                    </button>

                    {showFlow && (
                        <div className={styles.modalBackdrop} onClick={() => setShowFlow(false)}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <button className={styles.closeButton} onClick={() => setShowFlow(false)}>✖</button>
                                <h2 className={styles.modalTitle}>{topic} Roadmap</h2>
                                <RoadmapCanvas data={data.roadmap} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}