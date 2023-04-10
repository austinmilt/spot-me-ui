import { SPOTME_TOP_ITEMS_URL } from "./constants";
import { ApiAmbiguousResultError, ApiClientError, ApiServerError, SpotifyMemberNotAllowlistedError } from "./error";

interface ApiResponse<T> {
    code: number;
    result?: T;
    error?: string;
}


export interface GetRecommendationsResult {
    recommendations: string[];
    genres: {
        [genre: string]: GenreMetadata
    }
}

export interface GenreMetadata {
    artists: GenreMetadataArtist[];
}

export interface GenreMetadataArtist {
    name: string;
    spotifyPageUrl: string;
    imageUrl: string;
}


export async function apiGetRecommendations(accessToken: string): Promise<GetRecommendationsResult> {
    const params = new URLSearchParams();
    params.append("access_token", accessToken);
    const response: Response = await fetch(`${SPOTME_TOP_ITEMS_URL}?${params.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
    return await handleApiResponse(response);
}


async function handleApiResponse<T>(response: Response): Promise<T> {
    const result: ApiResponse<T> = await response.json();
    if ((result.code === 0) && (result.result != null)) {
        return result.result;

    } else if (result.code === 3) {
        throw new SpotifyMemberNotAllowlistedError();

    } else if (result.code === 1) {
        throw new ApiServerError();

    } else if (result.code === 2) {
        throw new ApiClientError();

    } else {
        throw new ApiAmbiguousResultError();
    }
}
