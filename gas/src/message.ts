/* {
    "blocks": [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "<https://developers.google.com/apps-script/guides/web|nya-n>"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": "nya-n",
                "emoji": true
            }
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Delete the bookmark",
                        "emoji": true
                    },
                    "style": "danger",
                    "action_id": "delete-the-bookmark"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Set a new URL",
                        "emoji": true
                    },
                    "action_id": "set-a-new-url"
                }
            ]
        }
    ]
} */
function createReminderMessage(bookmark: SimplifiedBookmark): { text: string, blocks } {
    const { title, url, date, tags } = bookmark;

    let header: string;

    try {
        UrlFetchApp.fetch(url);
        // If url is available for access,
        header = `<${url}|${title}>`; // linked title
    } catch (e) {
        // Otherwise,
        header = title;
    }

    header += ` (${date.getFullYear()}/${date.getMonth() + 1})`;

    const text = [header, 'Tags: ' + tags].join('\n');
    const blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": header
            }
        },
        {
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": 'Tags: ' + tags
            }
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Delete the bookmark"
                    },
                    "style": "danger",
                    "action_id": "delete_the_bookmark",
                    "value": JSON.stringify({
                        bookmark_url: url
                    })
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Set a new URL"
                    },
                    "action_id": "set_a_new_url",
                    "value": JSON.stringify({
                        bookmark_url: url
                    })
                }
            ]
        }
    ];

    return { text, blocks };
}