import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import styles from "./styles/App.module.css";

export default function App() {
    return (
        <div className={styles.app}>
            <header className={styles.header}>
                <Link to="/" className={styles.logo}>
                    LearnAnything<span className={styles.dot}>●</span>
                </Link>
            </header>
            <main className={styles.main}>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>

            </main>
            <footer className={styles.footer}>
                <p>© {new Date().getFullYear()} LearnAnything.ai</p>
          </footer>
        </div>
    )   
}