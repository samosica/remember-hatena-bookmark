import axios from "axios";
import { Block } from "@slack/web-api";

/**
 * Create a reminder message from a bookmark
 * @param bookmark
 */
export const createReminderMessage = async ({ title, url, date, tags }: {
    title: string,
    url: string,
    date: Date,
    tags: string[],
}): Promise<{ text: string, blocks: Block[] }> => {
    let header: string;

    const res = await axios(url);
    if (200 <= res.status && res.status < 300) { // If url is available for access,
        header = `<${url}|${title}>`; // linked title
    } else { // Otherwise,
        header = title;
    }

    header += ` (${date.getFullYear()}/${date.getMonth() + 1})`;

    const tagLine = 'Tags: ' + tags.join(', ');

    const text = [header, tagLine].join('\n');
    const blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": header,
            },
        },
        {
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": tagLine,
            },
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Delete the bookmark",
                    },
                    "style": "danger",
                    "action_id": "delete_the_bookmark",
                    "value": JSON.stringify({
                        bookmark_url: url,
                    }),
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Set a new URL",
                    },
                    "action_id": "set_a_new_url",
                    "value": JSON.stringify({
                        bookmark_url: url,
                    }),
                },
            ],
        },
    ];

    return { text, blocks };
};