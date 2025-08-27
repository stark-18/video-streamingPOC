# Video Streaming App (POC)

A proof‑of‑concept full‑stack video upload and streaming application. The app lets users upload a video from the browser, stores it on the server, lists uploaded items in a library, and plays them in the client. The backend is built with Express, Multer, and UUID; the frontend uses Vite + React.

> Note: Current default flow stores and serves the original MP4 for reliability. HLS conversion via FFmpeg can be re‑enabled later (see Optional: HLS conversion).

---

## Features

- Upload videos from the browser (multipart/form‑data)
- Persist uploads on disk with unique UUID‑based directory per upload
- Simple, clean React UI (upload, player, library)
- Video library endpoint with metadata (filename, size, uploadedAt)
- Secure static serving under `/uploads`
- CORS enabled for local development (3000/5173/5174)

---

## Tech Stack

- Backend: Node.js, Express, Multer, UUID
- Frontend: Vite, React, Axios, MUI
- Optional processing: FFmpeg (for HLS)

---

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ (ships with Node.js)
- Optional (only if you plan to enable HLS): FFmpeg installed and available on PATH

Check versions:

```bash
node -v
npm -v
ffmpeg -version   # optional
```

---

## Project Structure

```
video-streamingPOC/
├── index.js                  # Express server
├── uploads/                  # Uploaded assets (gitignored except placeholder)
│   └── courses/              # Per‑video UUID directories
├── frontend/                 # Vite + React client
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUploader.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   └── VideoList.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
├── package.json              # Backend scripts/deps
└── README.md
```

---

## Getting Started

### 1) Install dependencies

Backend:
```bash
cd /Users/anshika/Desktop/video-streamingPOC
npm install
```

Frontend:
```bash
cd /Users/anshika/Desktop/video-streamingPOC/frontend
npm install
```

### 2) Run the app (two terminals)

Backend (port 8000):
```bash
cd /Users/anshika/Desktop/video-streamingPOC
npm start
```

Frontend (Vite dev server, usually 5173 or 5174):
```bash
cd /Users/anshika/Desktop/video-streamingPOC/frontend
npm run dev
```

Open the browser at the URL printed by Vite (e.g., http://localhost:5173).

---

## Configuration

CORS is enabled for:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5174`

If your frontend runs on a different port, add it to the `origin` allowlist in `index.js`:

```js
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

Storage paths:
- Uploads root: `./uploads`
- Per‑upload directory: `./uploads/courses/<lessonId>`

---

## REST API

Base URL: `http://localhost:8000`

- POST `/_upload_`
  - Form field: `file` (required)
  - Response:
    ```json
    {
      "message": "Video uploaded successfully",
      "lessonId": "<uuid>",
      "videoUrl": "http://localhost:8000/uploads/courses/<uuid>/original.mp4"
    }
    ```

- GET `/_videos_`
  - Returns an array of uploaded items with metadata.
  - Example item:
    ```json
    {
      "id": "<uuid>",
      "filename": "video.mp4",
      "videoUrl": "http://localhost:8000/uploads/courses/<uuid>/original.mp4",
      "uploadedAt": "2025-08-27T05:49:07.475Z",
      "fileSize": 27224871,
      "duration": "Unknown"
    }
    ```

- GET `/_video-status_/:id`
  - Returns existence and metadata flags for a given upload directory.

- DELETE `/_videos_/:id`
  - Deletes an uploaded item folder (id = `lessonId`).

- GET `/uploads/*`
  - Serves static files under `uploads` (used by `videoUrl`).

---

## Frontend Components (src/components)

- `FileUploader.jsx` – drag‑and‑drop/select file, progress display, calls `/upload` via Axios
- `VideoList.jsx` – fetches from `/videos` and lists uploads; click to play
- `VideoPlayer.jsx` – plays the selected video URL (MP4/HLS depending on source)

---

## Optional: HLS conversion (FFmpeg)

The backend contains commented/alternate code paths for converting uploads to HLS (`index.m3u8` + `segmentXXX.ts`) using FFmpeg. The current default returns the original MP4 for reliability and speed. To enable HLS:

1. Ensure FFmpeg is installed and accessible: `ffmpeg -version`
2. Replace the simplified copy logic in `POST /upload` with the FFmpeg command block (see comments in `index.js`).
3. Confirm that `/videos` prefers the HLS URL when `index.m3u8` exists.

Pros of HLS:
- Adaptive bitrate streaming
- Better compatibility with HTML5 media pipelines at scale

Trade‑offs:
- Server CPU usage for transcoding
- Slower first response while conversion runs

---

## Troubleshooting

- CORS error in browser console
  - Ensure the frontend origin is included in the `origin` array in `index.js`.
- "No response from server" during upload
  - Verify backend is running on port 8000 and reachable.
  - Check terminal logs; the server logs each `POST /upload` with filename, size, and response status.
- Large file uploads
  - Multer limits are set to 100 MB. Adjust in `index.js` under the multer config if needed.
- Port conflicts
  - Vite may run on a different port than 5173; use the one printed in the terminal.

---

## Scripts

Backend (`package.json`):
- `npm start` – run backend with `nodemon index.js`

Frontend (`frontend/package.json`):
- `npm run dev` – start Vite dev server

---

## License

ISC

---

## Acknowledgements

- FFmpeg team for the transcoding toolkit
- Vite & React community

---

## Author

Replace with your details (name, email, website) if you publish this repository.