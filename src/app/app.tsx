import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getAccessToken, redirectToAuthCodeFlow } from "../lib/spotify";
import styles from "./app.module.css";
import {
  SpotifyAccessExpiredError,
  SpotifyInvalidAuthError,
  SpotifyMemberNotAllowlistedError,
} from "../lib/error";
import { GetRecommendationsResult, apiGetRecommendations } from "../lib/api";
import { Modal, ModalProvider } from "./modal";
import { Flier, FlierSkeleton } from "./Flier";

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

  const recommendation: GetRecommendationsResult['recommendations'][0] | undefined = useMemo(() => (
    recommendations ? recommendations.recommendations[0] : undefined
  ), [recommendations]);

  return (
    <ModalProvider>
      <main className={styles.main}>
        <section>
          {accessToken == null && (
            <div className={styles.prelogin}>
              <h2>Spot Me: Log in to your spotify and start generating fake concert fliers.</h2>
              <button
                className={styles.spotmeButton}
                onClick={redirectToAuthCodeFlow}
                disabled={loading || notAllowlisted}
              >
                Log in to Spotify
              </button>
            </div>
          )}
          {accessToken != null && (
            <button
              className={styles.spotmeButton}
              onClick={onGenerateRecommendations}
              disabled={loading || notAllowlisted}
            >
              Gimme a Flier
            </button>
          )}
        </section>
        <section
          style={{
            width: "85vw",
            maxWidth: "40rem",
            color: "white",
            textAlign: "center",
          }}
        >
          {loading && <FlierSkeleton />}
          {!loading && (recommendation != null) && (recommendations?.flierUrl != null) && (
            <Flier
              concertDescription={recommendation}
              flierUrl={recommendations.flierUrl}
              genres={recommendations.genres}
            />
          )}
          {!loading && notAllowlisted && (
            <div>
              Looks like you're not registered to use Spot Me. Get registered
              by <GetRegisteredEmailLink>sending me an email</GetRegisteredEmailLink> with
              your name and the email you used to register with Spotify. I'll send a response
              email when you are registered.
            </div>
          )}
        </section>
        <Modal />
        <footer className={styles.footer}>
          <a href="https://github.com/austinmilt/spot-me-ui">GitHub</a>
        </footer>
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
