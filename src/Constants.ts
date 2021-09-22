import { LavasfyOptions, NodeOptions } from ".";

export const DefaultLavasfyOptions: LavasfyOptions = {
    // @ts-expect-error unassignable
    clientID: null,
    // @ts-expect-error unassignable
    clientSecret: null,
    playlistPageLimit: 2,
    audioOnlyResults: false,
    useSpotifyMetadata: false,
    autoResolve: false
};

export const DefaultNodeOptions: NodeOptions = {
    // @ts-expect-error unassignable
    id: null,
    // @ts-expect-error unassignable
    baseURL: null,
    // @ts-expect-error unassignable
    password: null
};
