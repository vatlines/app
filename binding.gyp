{
    "targets": [
        {
            "target_name": "keybind",
            "sources": ["keybind.cc"],
            "defines": ["NAPI_CPP_EXCEPTIONS"],
            "win_delay_load_hook": "true"
        }
    ],
    "dependencies": [
"<!(node -p \"require('node-addon-api').targets\"):node_addon_api_maybe",
    ],
}