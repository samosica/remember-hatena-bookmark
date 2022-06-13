import { Client } from "hatena-bookmark-api";
import { Bookmark } from "hatena-bookmark-api/lib/client";
import axios from "axios";

/**
 * Promisified setTimeout
 * @param ms 
 */
export const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Move a bookmark in Hatena Bookmark
 * @param oldURL 
 * @param newURL 
 * @param client 
 */
export const moveBookmark = async (
    oldURL: string,
    newURL: string,
    client: Client
): Promise<Bookmark> => {
    // 1. Retrieve the bookmark of oldURL
    const oldBookmark = await client.getBookmark({ url: oldURL });
    await wait(3000);
    // 2. Set the bookmark as the one of newURL
    const newBookmark = await client.postBookmark({
        comment: oldBookmark.comment,
        private: oldBookmark.private,
        tags: oldBookmark.tags,
        url: newURL,
    });
    await wait(3000);
    // 3. Delete the old bookmark
    await client.deleteBookmark({ url: oldURL });
    return newBookmark;
}

/**
 * Get the title of url
 * @param url 
 */
export const getPageTitle = async (url: string): Promise<string | undefined> => {
    const res = await axios.get<string>(url);
    const body = res.data;
    const match = /<title>(.+?)<\/title>/.exec(body);

    if (match) {
        return match[1];
    }

    return undefined;
}