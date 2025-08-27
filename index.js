import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import {exec} from "child_process"; //watch out
import { stderr,stdout } from "process";

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads",express.static("uploads"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname+'-'+uuidv4()+path.extname(file.originalname));
    }

});
// multer config with file size limits
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 1
    }
});


app.post("/upload", upload.single("file"), (req, res) => {
    console.log("Upload endpoint called");
    
    // Handle multer errors
    if (req.fileValidationError) {
        console.log("File validation error:", req.fileValidationError);
        return res.status(400).json({ error: req.fileValidationError });
    }
    
    if (req.fileFilterError) {
        console.log("File filter error:", req.fileFilterError);
        return res.status(400).json({ error: req.fileFilterError });
    }
    
    try {
        if (!req.file) {
            console.log("No file in request");
            return res.status(400).json({ error: "No file uploaded" });
        }
        
        console.log("File uploaded:", req.file.originalname);
        console.log("File size:", req.file.size);
        console.log("File path:", req.file.path);
        
        const lessonId = uuidv4();
        const videoPath = req.file.path;
        const outputPath = `./uploads/courses/${lessonId}`;
        const hlspath = `${outputPath}/index.m3u8`;
        console.log("hlspath", hlspath);

        if(!fs.existsSync(outputPath)){
            fs.mkdirSync(outputPath, {recursive: true});
        }
        
        // Store metadata about the original file
        const metadata = {
            originalName: req.file.originalname,
            originalPath: req.file.path,
            fileSize: req.file.size,
            uploadedAt: new Date().toISOString(),
            lessonId: lessonId,
            duration: 'Unknown'
        };
        
        // Save metadata to a JSON file
        const metadataPath = `${outputPath}/metadata.json`;
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        
        // For now, just copy the original file and return success
        // This will help us test if the upload endpoint works without FFmpeg
        const originalFileCopy = `${outputPath}/original.mp4`;
        fs.copyFileSync(videoPath, originalFileCopy);
        
        console.log('File uploaded successfully (without conversion)');
        console.log('Sending response...');
        res.json({
            message: "Video uploaded successfully",
            lessonId: lessonId,
            videoUrl: `http://localhost:8000/uploads/courses/${lessonId}/original.mp4`
        });
        console.log('Response sent');
        
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get('/', (req, res) => {
    res.json({ message: "Hello World" });
}); 

// Endpoint to get all videos
app.get('/videos', (req, res) => {
    try {
        const coursesDir = './uploads/courses';
        const videos = [];
        
        if (fs.existsSync(coursesDir)) {
            const courseFolders = fs.readdirSync(coursesDir);
            
            courseFolders.forEach(folder => {
                const folderPath = path.join(coursesDir, folder);
                const stats = fs.statSync(folderPath);
                
                if (stats.isDirectory()) {
                    const m3u8Path = path.join(folderPath, 'index.m3u8');
                    const originalPath = path.join(folderPath, 'original.mp4');
                    const metadataPath = path.join(folderPath, 'metadata.json');
                    
                    // Check for either HLS file or original MP4 file
                    if (fs.existsSync(m3u8Path) || fs.existsSync(originalPath)) {
                        // Determine video URL based on available files
                        let videoUrl = `http://localhost:8000/uploads/courses/${folder}/index.m3u8`;
                        if (!fs.existsSync(m3u8Path) && fs.existsSync(originalPath)) {
                            videoUrl = `http://localhost:8000/uploads/courses/${folder}/original.mp4`;
                        }
                        
                        let videoInfo = {
                            id: folder,
                            filename: 'Video',
                            videoUrl: videoUrl,
                            uploadedAt: stats.mtime,
                            fileSize: 0,
                            duration: 'Unknown'
                        };
                        
                        // Try to load metadata if it exists
                        if (fs.existsSync(metadataPath)) {
                            try {
                                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                                videoInfo.filename = metadata.originalName || 'Video';
                                videoInfo.fileSize = metadata.fileSize || 0;
                                videoInfo.uploadedAt = metadata.uploadedAt || stats.mtime;
                                videoInfo.duration = metadata.duration || 'Unknown';
                            } catch (metadataError) {
                                console.error('Error reading metadata:', metadataError);
                            }
                        }
                        
                        videos.push(videoInfo);
                    }
                }
            });
        }
        
        // Sort videos by upload date (newest first)
        videos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// Endpoint to check video conversion status
app.get('/video-status/:id', (req, res) => {
    try {
        const videoId = req.params.id;
        const videoPath = `./uploads/courses/${videoId}`;
        const m3u8Path = `${videoPath}/index.m3u8`;
        const metadataPath = `${videoPath}/metadata.json`;
        
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        const status = {
            id: videoId,
            exists: true,
            hasMetadata: fs.existsSync(metadataPath),
            hasHLS: fs.existsSync(m3u8Path),
            isComplete: fs.existsSync(m3u8Path)
        };
        
        if (status.hasMetadata) {
            try {
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                status.metadata = metadata;
            } catch (e) {
                console.error('Error reading metadata:', e);
            }
        }
        
        res.json(status);
    } catch (error) {
        console.error('Error checking video status:', error);
        res.status(500).json({ error: 'Failed to check video status' });
    }
});

// Endpoint to delete a video
app.delete('/videos/:id', (req, res) => {
    try {
        const videoId = req.params.id;
        const videoPath = `./uploads/courses/${videoId}`;
        
        if (fs.existsSync(videoPath)) {
            fs.rmSync(videoPath, { recursive: true, force: true });
            res.json({ message: 'Video deleted successfully' });
        } else {
            res.status(404).json({ error: 'Video not found' });
        }
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
