export class Util {
    public static pattern = /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track)(?:[/:])([A-Za-z0-9]+).*$/;

    public static isValidURL(url: string): boolean {
        return Util.pattern.test(url);
    }

    public static parseURL(url: string): { type: string; id: string } {
        const [, type, id] = Util.pattern.exec(url) ?? [];
        return { type, id };
    }

    public static merge<T>(def: T, given = {} as T): T {
        for (const key in def) {
            if (!{}.hasOwnProperty.call(given, key)) {
                if (def[key] === null) {
                    throw Error(`Missing required property: ${key}`);
                }
                given[key] = def[key];
            } else if (given[key] === Object(given[key])) {
                given[key] = Util.merge(def[key], given[key]);
            }
        }

        return given;
    }
}
