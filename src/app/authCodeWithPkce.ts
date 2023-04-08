// copied from https://github.com/spotify/web-api-examples/tree/master/get_user_profile

import {
  SpotifyAccessExpiredError,
  SpotifyInvalidAuthError,
} from "../lib/error";
import {
  SPOTIFY_ACCESS_TOKEN_URL,
  SPOTIFY_AUTH_REDIRECT_URL,
  SPOTIFY_AUTH_URL,
} from "../lib/env";

export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", SPOTIFY_AUTH_REDIRECT_URL);
  params.append("scope", "user-library-read");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export async function getAccessToken(clientId: string, code: string) {
  const verifier = localStorage.getItem("verifier");
  if (verifier == null) {
    throw new Error("Missing required local storage: verifier");
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", SPOTIFY_AUTH_REDIRECT_URL);
  params.append("code_verifier", verifier);

  const response = await fetch(SPOTIFY_ACCESS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const result = await response.json();
  if (result.error != null) {
    if (result.error_description === "Authorization code expired") {
      throw new SpotifyAccessExpiredError(result.error_description);
    } else if (result.error_description === "Invalid authorization code") {
      throw new SpotifyInvalidAuthError(result.error_description);
    } else {
      throw new Error(result.error_description);
    }
  }
  return result.access_token;
}

function generateCodeVerifier(length: number) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
