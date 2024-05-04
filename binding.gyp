{
    "targets": [
        {
            "target_name": "keybind",
            "sources": ["keybind.cc"],
            "defines": ["NAPI_CPP_EXCEPTIONS"],
        }
    ],
    "dependencies": [
"<!(node -p \"require('node-addon-api').targets\"):node_addon_api_maybe",
    ],
}