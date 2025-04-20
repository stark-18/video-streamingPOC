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
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true
}));

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "origin,x-requested-with, content-type, accept");
    next();
})

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
// multer config
const upload = multer({storage: storage});


app.post("/upload", upload.single("file"), (req, res) => {
    // res.json({ message: "Video uploaded successfully" });
    const lessonId = uuidv4();
    const videoPath = req.file.path ;
    const outputPath = `./uploads/courses/${lessonId}`;
    const hlspath = `${outputPath}/index.m3u8`;
    console.log("hlspath", hlspath);

    if(!fs.existsSync(outputPath)){
        fs.mkdirSync(outputPath, {recursive: true});
    }
    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlspath}` ;

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if(error){
            console.log(`exec error: ${error}`)

        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`;
        res.json({
            message: "Video converted to hls successfully",
            lessonId: lessonId,
            videoUrl: videoUrl
        })
    })

});
app.get('/', (req, res) => {
    res.json({ message: "Hello World" });
}); 

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
