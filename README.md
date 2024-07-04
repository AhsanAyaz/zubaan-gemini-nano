# Zubaan - A gemini-nano based translations app

This app uses the on-device Gemini Nano model (supported in chrome 127+) for translations using both text input, and voice input as well.

## Enable AI in Chrome

Chrome [built-in AI](https://developer.chrome.com/docs/ai/built-in) is a preview feature, you need to use chrome version 127 or greater, now in [dev](https://www.google.com/chrome/dev/?extra=devchannel) or [canary](https://www.google.com/chrome/canary/) channel, [may release on stable chanel at Jul 17, 2024](https://chromestatus.com/roadmap).

After then, you should turn on these flags:
* [chrome://flags/#prompt-api-for-gemini-nano](chrome://flags/#prompt-api-for-gemini-nano): `Enabled`
* [chrome://flags/#optimization-guide-on-device-model](chrome://flags/#optimization-guide-on-device-model): `Enabled BypassPrefRequirement`
* [chrome://components/](chrome://components/): Click `Optimization Guide On Device Model` to download the model.