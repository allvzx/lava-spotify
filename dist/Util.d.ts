export default class Util {
    static try<T>(fn: () => T): T | undefined;
    static tryPromise<T>(fn: () => Promise<T>): Promise<T | undefined>;
}