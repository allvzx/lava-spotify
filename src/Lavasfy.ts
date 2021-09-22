import { request } from "undici";
import { Constants, LavalinkTrackResponse, Node, NodeOptions, Util } from ".";

export class Lavasfy {
    public nodes = new Map<string, Node>();
    public options: LavasfyOptions;
    public token!: string | null;
    public baseURL = "https://api.spotify.com/v1";

    private nextRequest?: NodeJS.Timeout;

    public constructor(options: LavasfyOptions, nodes: NodeOptions[] = []) {
        this.options = Util.merge(Constants.DefaultLavasfyOptions, options);

        Object.defineProperty(this, "token", { value: null, configurable: true });

        for (const node of nodes) this.addNode(node);
    }

    public addNode(options: NodeOptions): void {
        this.nodes.set(options.id, new Node(this, options));
    }

    public getNode(): Node;
    public getNode(id: string): Node | undefined
    public getNode(id?: string): Node | undefined {
        if (!this.nodes.size) throw new Error("No nodes available, please add a node first...");
        if (id && !this.nodes.has(id)) throw new Error("Provide a valid node identifier.");
        return this.nodes.get(id ?? [...this.nodes.keys()][Math.floor(Math.random() * this.nodes.size)]);
    }

    public removeNode(id: string): boolean {
        if (!this.nodes.size) throw new Error("No nodes available, please add a node first...");
        if (!id && !this.nodes.has(id)) throw new Error("Provide a valid node identifier.");
        return this.nodes.delete(id);
    }

    public load(url: string, node: Node | string): Promise<LavalinkTrackResponse> {
        if (typeof node === "string") node = this.getNode(node)!;
        return node.load(url);
    }

    public async requestToken(): Promise<void> {
        if (this.nextRequest) return;

        const { statusCode, body } = await request("https://accounts.spotify.com/api/token", {
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${Buffer.from(`${this.options.clientID}:${this.options.clientSecret}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST"
        });

        if (statusCode === 400) return Promise.reject(new Error("Invalid Spotify client."));
        // if statusCode isn't "ok"
        if (!(statusCode >= 200 && statusCode < 300)) return this.requestToken();

        const { access_token, token_type, expires_in } = await body.json();

        Object.defineProperty(this, "token", { value: `${token_type} ${access_token}` });
        Object.defineProperty(this, "nextRequest", {
            configurable: true,
            value: setTimeout(() => {
                delete this.nextRequest;
                void this.requestToken();
            }, expires_in * 1000)
        });
    }
}

export interface LavasfyOptions {
    /** Spotify client ID */
    clientID: string;
    /** Spotify client Secret */
    clientSecret: string;
    /**
      * Maximum pages of playlist to load (each page contains 100 tracks)
      * @default 2
      */
    playlistPageLimit?: number;
    /**
      * This will filter the search to video that only contains audio of the Spotify track (likely)
      * @default false
      */
    audioOnlyResults?: boolean;
    /**
      * The original value of title, author, and uri in {@link LavalinkTrack} will be replaced to Spotify's
      * @default false
      */
    useSpotifyMetadata?: boolean;
    /**
      * Auto resolve the Spotify track to Lavalink track
      *
      * It's not recommended to enable this option, enabling it will spam HTTP requests to YouTube and take a while for large playlists to load.
      * @default false
      */
    autoResolve?: boolean;
}
