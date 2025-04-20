# Video Streaming POC

A proof-of-concept video streaming application that implements HTTP Live Streaming (HLS) protocol for efficient video delivery. This project demonstrates how to handle video uploads, process them using FFmpeg, and stream them using HLS.

## Features

- Video upload and processing
- HLS (HTTP Live Streaming) implementation
- Adaptive bitrate streaming
- Secure file handling with UUID-based naming
- RESTful API endpoints
- CORS enabled for cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/stark-18/video-streamingPOC.git
cd video-streamingPOC
```

2. Install dependencies:
```bash
npm install
```

3. Create required directories:
```bash
mkdir -p uploads/courses
```

## Usage

1. Start the server:
```bash
npm start
```

2. The server will run on `http://localhost:8000`

3. API Endpoints:
   - POST `/upload` - Upload video files
   - GET `/` - Health check endpoint

## API Documentation

### Upload Video
- **Endpoint:** POST `/upload`
- **Content-Type:** multipart/form-data
- **Body:** 
  - `file`: Video file to upload
- **Response:**
```json
{
    "message": "Video converted to hls successfully",
    "lessonId": "uuid",
    "videoUrl": "http://localhost:8000/uploads/courses/{lessonId}/index.m3u8"
}
```

## Project Structure

```
video-streamingPOC/
├── index.js           # Main server file
├── uploads/           # Directory for uploaded files
│   └── courses/      # Processed video segments
├── package.json
└── README.md
```

## Technologies Used

- Express.js - Web framework
- Multer - File upload handling
- FFmpeg - Video processing
- UUID - Unique identifier generation
- CORS - Cross-origin resource sharing

## License

ISC

## Author

[Your Name]