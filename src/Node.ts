import { request } from "undici";
import { Constants, LavalinkTrack, LavalinkTrackResponse, Lavasfy, SpotifyAlbum, SpotifyPlaylist, SpotifyTrack, UnresolvedTrack, Util } from ".";

export class Node {
    public id!: string;
    public baseURL!: string;
    public password!: string;
    public constructor(public lavasfy: Lavasfy, options: NodeOptions) {
        for (const key in Util.merge(Constants.DefaultNodeOptions, options)) Object.defineProperty(this, key, { value: options[key as keyof NodeOptions] });
    }

    public async resolve(url: string): Promise<LavalinkTrackResponse> {
        if (!this.lavasfy.token) throw Error("Missing Spotify access token.");
        if (!Util.isValidURL(url)) throw Error("Invalid URL");

        const { type, id } = Util.parseURL(url);
        const reqUrl = `${this.lavasfy.baseURL}/${type}s/${id}`;

        let loadType: LavalinkTrackResponse["loadType"] = "NO_MATCHES";
        const playlistInfo: LavalinkTrackResponse["playlistInfo"] = {};
        const tracks: Array<UnresolvedTrack | LavalinkTrack> = [];

        switch (type) {
            case "album": {
                const { statusCode, body } = await request(reqUrl, {
                    headers: {
                        Authorization: this.lavasfy.token
                    },
                    method: "GET"
                });
                const album: SpotifyAlbum = await body.json();
                loadType = "PLAYLIST_LOADED";
                playlistInfo.name = album.name;
                tracks.push(...album.tracks.items.map(this.buildUnresolved.bind(this)));
                break;
            }
            case "playlist": {
                const { statusCode, body } = await request(reqUrl, {
                    headers: {
                        Authorization: this.lavasfy.token
                    },
                    method: "GET"
                });
                const playlist: SpotifyPlaylist = await body.json();
                loadType = "PLAYLIST_LOADED";
                playlistInfo.name = playlist.name;
                tracks.push(...playlist.tracks.items.map(x => this.buildUnresolved(x.track)));
                break;
            }
            case "track": {
                const { statusCode, body } = await request(reqUrl, {
                    headers: {
                        Authorization: this.lavasfy.token
                    },
                    method: "GET"
                });
                const json: SpotifyTrack = await body.json();
                loadType = "TRACK_LOADED";
                tracks.push(this.buildUnresolved(json));
                break;
            }
        }
        return {
            loadType,
            playlistInfo,
            tracks
        };
    }

    private async retrieveTrack(unresolved: UnresolvedTrack): Promise<LavalinkTrack | undefined> {
        const params = new URLSearchParams({
            identifier: `ytsearch:${unresolved.info.author} - ${unresolved.info.title}`
        }).toString();
        const reqUrl = `${this.baseURL}/loadtracks?${params}`;

        const { body } = await request(reqUrl, {
            headers: {
                Authorization: this.password
            },
            method: "GET"
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return body.json().then(x => x.tracks[0]);
    }

    private buildUnresolved(track: SpotifyTrack): UnresolvedTrack {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const _this = this;
        return {
            info: {
                identifier: track.id,
                author: track.artists.map(x => x.name).join(", "),
                length: track.duration_ms,
                sourceName: "spotify",
                title: track.name,
                uri: track.external_urls.spotify
            },
            resolve(): Promise<LavalinkTrack | undefined> {
                return _this.retrieveTrack(this);
            }
        };
    }
}

export interface NodeOptions {
    id: string;
    baseURL: string;
    password: string;
}
