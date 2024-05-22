#include "./node_modules/node-addon-api/napi.h"
#include <uv.h>
#include <thread>
#include <mutex>
#include <iostream>
#include <vector>
#include <unordered_set>
#include <chrono>
#ifdef _WIN32
#include <windows.h>
#endif

Napi::ThreadSafeFunction tsfn;

std::vector<int32_t> ptt_keys;
std::mutex dataMutex;
bool sentUpdate = false;

std::thread listenerThread;
std::atomic<bool> stopThread(false);

bool isKeyDown(int keyCode)
{
#ifdef _WIN32
    return GetAsyncKeyState(keyCode) & 0x8000;
#else
    return false;
#endif
}

std::vector<int32_t> ArrayToVector(const Napi::Array &array)
{
    std::vector<int32_t> result;
    uint32_t length = array.Length();

    for (uint32_t i = 0; i < length; ++i)
    {
        Napi::Value element = array.Get(i);
        if (element.IsNumber())
        {
            result.push_back(element.As<Napi::Number>().Int32Value());
        }
    }

    return result;
}

void keyboardInputListener(const Napi::Env &env)
{
    std::unordered_set<int> heldKeys;

    while (!stopThread)
    {
        {
            heldKeys.clear();
            std::lock_guard<std::mutex> lock(dataMutex);

            if (ptt_keys.size() > 0)
            {
                for (int keyCode : ptt_keys)
                {
                    if (isKeyDown(keyCode))
                    {
                        heldKeys.insert(keyCode);
                    }
                }

                bool allRequiredKeysPressed = true;
                for (int keyCode : ptt_keys)
                {
                    if (heldKeys.find(keyCode) == heldKeys.end())
                    {
                        allRequiredKeysPressed = false;
                        break;
                    }
                }

                if (allRequiredKeysPressed && !sentUpdate)
                {
                    tsfn.BlockingCall([](Napi::Env env, Napi::Function jsCallback)
                                      {
            // Call the async callback function
            jsCallback.Call({Napi::String::New(env, "PTT_DOWN")}); });
                    sentUpdate = true;
                }
                else if (!allRequiredKeysPressed && sentUpdate)
                {
                    tsfn.BlockingCall([](Napi::Env env, Napi::Function jsCallback)
                                      {
            // Call the async callback function
            jsCallback.Call({Napi::String::New(env, "PTT_UP")}); });
                    sentUpdate = false;
                }
            }
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

Napi::Value StartListening(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    stopThread = true;
    if (listenerThread.joinable())
    {
        listenerThread.join();
    }

    tsfn = Napi::ThreadSafeFunction::New(
        env,
        info[0].As<Napi::Function>(), // JavaScript callback
        "KeyboardInputListener",
        0, // Unlimited queue size
        1  // Only one thread will use this
    );

    stopThread = false;
    listenerThread = std::thread(keyboardInputListener, env);
    listenerThread.detach();

    return env.Undefined();
}

Napi::Value UpdatePttKeys(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    Napi::Array array = info[0].As<Napi::Array>();

    std::vector<int32_t> results = ArrayToVector(array);
    {
        std::lock_guard<std::mutex> lock(dataMutex);
        ptt_keys = results;
        sentUpdate = false;
    }
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set(Napi::String::New(env, "startListening"), Napi::Function::New(env, StartListening));
    exports.Set(Napi::String::New(env, "setPttKeys"), Napi::Function::New(env, UpdatePttKeys));
    return exports;
}

NODE_API_MODULE(addon, Init)