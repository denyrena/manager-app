export interface SpotifyPage<T> {
    href: string; // A link to the Web API endpoint returning the full result of the request.
    items: T[]; // an array of objects	The requested data.
    limit: number; // The maximum number of items in the response (as set in the query or by default).
    next: string; // URL to the next page of items. ( null if none)
    offset: number; // The offset of the items returned (as set in the query or by default).
    previous: string; // URL to the previous page of items. ( null if none)
    total: number; // The maximum number of items available to return.
}
