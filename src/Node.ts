import { Constants, Lavasfy, Util } from ".";

export class Node {
    public options!: NodeOptions;
    public constructor(public lavasfy: Lavasfy, options: NodeOptions) {
        Object.defineProperty(this, "options", { value: Util.merge(Constants.DefaultNodeOptions, options) });
    }

    /* public async resolve(url: string): Promise<any> {
        if (!Util.isValidURL(url)) return;
        const { type, id } = Util.parseURL(url);

        switch (type) {
            case "":
        }
    } */
}

export interface NodeOptions {
    id: string;
    baseURL: string;
    password: string;
}
