import { useState, useMemo } from "react";
import { GetRecommendationsResult, GenreMetadata, GenreMetadataArtist } from "../lib/api";
import { useModal } from "./modal";
import styles from "./app.module.css";

interface RecommendationsProps {
    recommendation: string;
    genres: GetRecommendationsResult['genres'];
}

export function Recommendation(props: RecommendationsProps): JSX.Element {
    const elements: JSX.Element[] = replaceGenreStrings(props.recommendation, props.genres);
    return <div style={{ textJustify: "auto" }}>{elements}</div>
}


function replaceGenreStrings(outerString: string, genres: GetRecommendationsResult['genres']): JSX.Element[] {
    let result: (string | JSX.Element)[] = [outerString];
    // sort genres decreasing by length to avoid replacing part of a longer genre with a shorter one
    const genresOrdered = Object.keys(genres).sort((a, b) => b.length - a.length);
    for (const genre of genresOrdered) {
        const updatedResult: (string | JSX.Element)[] = [];
        for (const element of result) {
            if (typeof element === 'string') {
                updatedResult.push(...replaceGenreString(element, genre, genres[genre]));

            } else {
                updatedResult.push(element);
            }
        }
        result = updatedResult;
    }

    return result.map((element, i) => (typeof element === 'string') ? <span key={i}>{element}</span> : element);
}


function replaceGenreString(
    outerString: string,
    genre: string,
    genreMetadata: GenreMetadata
): (string | JSX.Element)[] {
    const splitString: string[] = outerString.split(genre);
    const result: (string | JSX.Element)[] = [splitString[0]];
    for (let i = 1; i < splitString.length; i++) {
        result.push(<GenreElement key={`${genre}-${i}-g`} genre={genre} metadata={genreMetadata} />);
        result.push(splitString[i]);
    }
    return result;
}


interface GenreElementProps {
    genre: string;
    metadata: GenreMetadata;
}


function GenreElement(props: GenreElementProps): JSX.Element {
    const { setContentAndUpdateShow: updateModal } = useModal();
    const [showCard, setShowCard] = useState<boolean>(false);
    const card: JSX.Element = useMemo(() => <GenreCard metadata={props.metadata} />, [props.metadata]);

    return (
        <span
            onFocus={() => updateModal(card)}
            onBlur={() => updateModal(undefined)}
            onClick={() => {
                console.log(showCard, card);
                updateModal(showCard ? undefined : card);
                setShowCard(!showCard);
            }}
            className={styles.genre}
        >
            <span className={styles.genreText}>{props.genre}</span>
        </span>
    )
}


function GenreCard(props: { metadata: GenreMetadata }): JSX.Element {
    const artist: GenreMetadataArtist = useMemo(() => (
        props.metadata.artists[Math.floor(Math.random() * props.metadata.artists.length)]
    ), [props.metadata.artists]);

    return (
        <div className={styles.genreCard}>
            <img src={artist.imageUrl} alt={`${artist.name} profile`} />
            <span>Because you like <a href={artist.spotifyPageUrl} target="_blank" rel="noreferrer" >{artist.name}</a></span>
        </div>
    )
}
