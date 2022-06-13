import { ViewsOpenArguments } from "@slack/web-api";

export const createSetANewURLModal = (
    triggerId: string,
    bookmarkURL: string,
    responseURL: string
): ViewsOpenArguments => {
    return {
        trigger_id: triggerId,
        view: {
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": "Set a new URL",
            },
            "submit": {
                "type": "plain_text",
                "text": "Submit",
            },
            "close": {
                "type": "plain_text",
                "text": "Cancel",
            },
            "blocks": [
                {
                    "type": "input",
                    "block_id": "plain_text_input",
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "new_url",
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "New URL",
                    },
                },
            ],
            "callback_id": "set_a_new_url_modal",
            "private_metadata": JSON.stringify({
                old_url: bookmarkURL,
                response_url: responseURL,
            }),
        },
    };
};