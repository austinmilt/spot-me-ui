// https://vitejs.dev/guide/env-and-mode.html

export const SPOTIFY_CLIENT_ID: string = parseEnv(
    "SPOTIFY_CLIENT_ID",
    import.meta.env.VITE_SPOTIFY_CLIENT_ID
);

export const SPOTIFY_AUTH_URL: string = parseEnv(
    "SPOTIFY_AUTH_URL",
    import.meta.env.VITE_SPOTIFY_AUTH_URL
);

export const SPOTIFY_ACCESS_TOKEN_URL: string = parseEnv(
    "SPOTIFY_ACCESS_TOKEN_URL",
    import.meta.env.VITE_SPOTIFY_ACCESS_TOKEN_URL
);

export const SPOTME_TOP_ITEMS_URL: string = parseEnv(
    "SPOTME_TOP_ITEMS_URL",
    import.meta.env.VITE_SPOTME_TOP_ITEMS_URL
);

export const SPOTIFY_AUTH_REDIRECT_URL: string = parseEnv(
    "SPOTIFY_AUTH_REDIRECT_URL",
    import.meta.env.VITE_SPOTIFY_AUTH_REDIRECT_URL
);


function parseEnv<T>(
    name: string,
    value: string | undefined,
    defaultValue?: T | undefined,
    transform: (v: string) => T = castString
): T {
    let result: T;
    if (value === undefined) {
        if (defaultValue === undefined) {
            throw new Error(`Missing required env variable ${name}.`);

        } else {
            result = defaultValue;
        }
    } else {
        result = transform(value);
    }
    return result;
}


function castString<T>(value: string): T {
    return value as T;
}
