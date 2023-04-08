import { useCallback, useEffect, useMemo, useState } from "react";
import { getAccessToken, redirectToAuthCodeFlow } from "./authCodeWithPkce";
import { SPOTIFY_CLIENT_ID, SPOTME_TOP_ITEMS_URL } from "../lib/env";
import styles from "./app.module.css";
import {
  SpotifyAccessExpiredError,
  SpotifyInvalidAuthError,
} from "../lib/error";

export default function App(): JSX.Element {
  //TODO move to provider
  const authorizationCode: string | null = useMemo(
    () => new URLSearchParams(window.location.search).get("code"),
    []
  );
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [recommendations, setRecommendations] = useState<
    string[] | undefined
  >();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  const onGenerateRecommendations = useCallback(() => {
    if (accessToken != null) {
      //TODO move to API SDK
      setLoading(true);
      const params = new URLSearchParams();
      params.append("access_token", accessToken);
      fetch(`${SPOTME_TOP_ITEMS_URL}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then((response) => response.json())
        .then((result) =>
          setRecommendations((result as ApiRecommendationsResponse).result)
        )
        .catch()
        .finally(() => setLoading(false));
    }
  }, [accessToken]);

  useEffect(() => {
    if (authorizationCode != null) {
      //TODO error handling, loading handling
      setLoading(true);
      getAccessToken(SPOTIFY_CLIENT_ID, authorizationCode)
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
        {!loading && recommendations != null && recommendations}
      </section>
      <section>
        {accessToken == null && (
          <button
            className={styles.spotmeButton}
            onClick={() => redirectToAuthCodeFlow(SPOTIFY_CLIENT_ID)}
          >
            Log in to Spotify
          </button>
        )}
        {accessToken != null && (
          <button
            className={styles.spotmeButton}
            onClick={onGenerateRecommendations}
            disabled={loading}
          >
            Generate
          </button>
        )}
      </section>
    </main>
  );
}

interface ApiRecommendationsResponse {
  result: string[];
}
