# hk_tts_web

A simple Cantonese text-to-speech demo that runs entirely in the browser using the Web Speech API.

## How to test locally
You can try the page before committing or opening a pull request:

1. Start a local web server from the project root (browsers apply fewer restrictions when a page is served over HTTP):
   ```bash
   python3 -m http.server 8000
   ```
2. Open http://localhost:8000/index.html in a desktop browser that supports the Web Speech API (e.g., Chrome or Edge).
3. Paste or type text into the textarea. It will expand automatically as you add more lines. Choose a voice and click **Speak** to listen.
4. Use **Pause**, **Resume**, and **Stop** to control playback. Click **Reload voices** if the Cantonese voices list looks empty.

You can also open `index.html` directly in a browser via the filesystem (`file://`) for a quick smoke test, though some browsers expose voices more reliably when served over HTTP.
