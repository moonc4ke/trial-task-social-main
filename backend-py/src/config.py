config = {
    "platforms": {
        "twitter": {"maxLength": 280, "hashtagLimit": 3, "name": "Twitter/X"},
        "instagram": {"maxLength": 2200, "hashtagLimit": 30, "name": "Instagram"},
        "linkedin": {"maxLength": 3000, "hashtagLimit": 5, "name": "LinkedIn"},
    },
    "generation": {
        "defaultPostCount": 5,
        "model": "gpt-4o",
        "temperature": 0.8,
        "maxTokens": 1000,
    },
    "api": {"timeout": 30000, "retries": 2},
}
