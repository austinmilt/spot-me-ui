import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getAccessToken, redirectToAuthCodeFlow } from "../lib/spotify";
import styles from "./app.module.css";
import {
  SpotifyAccessExpiredError,
  SpotifyInvalidAuthError,
  SpotifyMemberNotAllowlistedError,
} from "../lib/error";
import { apiGetRecommendations } from "../lib/api";

export default function App(): JSX.Element {
  //TODO move to provider
  const authorizationCode: string | null = useMemo(
    () => new URLSearchParams(window.location.search).get("code"),
    []
  );
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [recommendations, setRecommendations] = useState<string[] | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [notAllowlisted, setNotAllowlisted] = useState<boolean>(true);
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
