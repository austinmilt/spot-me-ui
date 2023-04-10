// App-specific errors to assist in graceful degradation of the app

export class SpotifyAccessExpiredError extends Error {
  //nada
}

export class SpotifyInvalidAuthError extends Error {
  //nada
}

export class SpotifyMemberNotAllowlistedError extends Error {
  //nada
}

export class ApiClientError extends Error {
  // nada
}

export class ApiServerError extends Error {
  //nada
}

export class ApiAmbiguousResultError extends Error {
  //nada
}
