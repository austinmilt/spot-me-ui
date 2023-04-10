import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getAccessToken, redirectToAuthCodeFlow } from "../lib/spotify";
import styles from "./app.module.css";
import {
  SpotifyAccessExpiredError,
  SpotifyInvalidAuthError,
  SpotifyMemberNotAllowlistedError,
} from "../lib/error";
import { GenreMetadata, GenreMetadataArtist, GetRecommendationsResult, apiGetRecommendations } from "../lib/api";
import { Modal, ModalProvider, useModal } from "./modal";

export default function App(): JSX.Element {
  //TODO move to provider
  const authorizationCode: string | null = useMemo(
    () => new URLSearchParams(window.location.search).get("code"),
    []
  );
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [recommendations, setRecommendations] = useState<GetRecommendationsResult | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [notAllowlisted, setNotAllowlisted] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  const onGenerateRecommendations = useCallback(() => {
    if (accessToken != null) {
      setLoading(true);
      setNotAllowlisted(false);
      apiGetRecommendations(accessToken)
        .then(setRecommendations)
        .catch(e => {
          if (e instanceof SpotifyMemberNotAllowlistedError) {
            setNotAllowlisted(true);
          } else {
            setError(e);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [accessToken]);

  useEffect(() => {
    if (authorizationCode != null) {
      setLoading(true);
      setNotAllowlisted(false);
      getAccessToken(authorizationCode)
        .then(setAccessToken)
        .catch((e) => {
          if (e instanceof SpotifyAccessExpiredError) {
            setRecommendations(undefined);
            setAccessToken(undefined);
          } else if (e instanceof SpotifyInvalidAuthError) {
            // swallow this for now because for some reason it is always thrown
          }
        })
        .finally(() => setLoading(false));
    }
  }, [authorizationCode]);

  useEffect(() => {
    if (error != null) {
      console.error(error);
    }
  }, [error]);

  return (
    <ModalProvider>
      <main className={styles.main}>
        <section
          style={{
            width: "85vw",
            maxWidth: "40rem",
            color: "white",
            textAlign: "center",
          }}
        >
          {loading && "Loading recommendations"}
          {!loading && (recommendations != null) && (
            recommendations.recommendations.map((r, i) => (
              <Recommendation key={i} recommendation={r} genres={recommendations.genres} />
            )))
          }
          {!loading && notAllowlisted && (
            <div>
              Looks like you're not registered to use Spot Me. Get registered
              by <GetRegisteredEmailLink>sending me an email</GetRegisteredEmailLink> with
              your name and the email you used to register with Spotify. I'll send a response
              email when you are registered.
            </div>
          )}
        </section>
        <section>
          {accessToken == null && (
            <button
              className={styles.spotmeButton}
              onClick={redirectToAuthCodeFlow}
              disabled={loading || notAllowlisted}
            >
              Log in to Spotify
            </button>
          )}
          {accessToken != null && (
            <button
              className={styles.spotmeButton}
              onClick={onGenerateRecommendations}
              disabled={loading || notAllowlisted}
            >
              Generate
            </button>
          )}
        </section>
        <Modal />
      </main>
    </ModalProvider>
  );
}


const GET_REGISTERED_HREF: string = "mailto:austin.w.milt@gmail.com?" +
  "subject=Spot Me Registration Request&" +
  "body=" +
  "[REPLACE WITH YOUR FIRST AND LAST NAME]%0D%0A" +
  "[REPLACE WITH YOUR SPOTIFY EMAIL]";

function GetRegisteredEmailLink(props: { children: React.ReactNode }): JSX.Element {
  return (
    <a href={GET_REGISTERED_HREF}>
      {props.children}
    </a>
  )
}


interface RecommendationsProps {
  recommendation: string;
  genres: GetRecommendationsResult['genres'];
}

function Recommendation(props: RecommendationsProps): JSX.Element {
  const elements: JSX.Element[] = replaceGenreStrings(props.recommendation, props.genres);
  return <div style={{ display: "block" }}>{elements}</div>
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
