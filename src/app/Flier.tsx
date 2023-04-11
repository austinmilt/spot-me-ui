import { GetRecommendationsResult } from "../lib/api";
import { Recommendation } from "./Recommendation";
import styles from "./app.module.css";

interface FlierProps {
    concertDescription: string;
    flierUrl: string;
    genres: GetRecommendationsResult['genres']
}

export function Flier(props: FlierProps): JSX.Element {
    return (
        <div className={styles.flier}>
            <img src={props.flierUrl} alt="Concert Flier" className={styles.flierImage} />
            <div className={styles.flierText}>
                <Recommendation recommendation={props.concertDescription} genres={props.genres} />
            </div>
        </div>
    )
}


export function FlierSkeleton(): JSX.Element {
    return <div className={`${styles.flierSkeleton} ${styles.shimmer}`} />;
}
