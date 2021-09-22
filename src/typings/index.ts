import { LavalinkTrack } from "..";

export interface UnresolvedTrack {
    info: {
        identifier: string;
        author: string;
        length: number;
        sourceName: string;
        title: string;
        uri: string;
    };
    resolve: () => Promise<LavalinkTrack | undefined>;
}

export * from "./Lavalink";
export * from "./Spotify";
