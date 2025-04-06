import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
});

const upload = multer({ storage });

app.post("/upload", upload.single("video"), (req, res) => {
    res.json({ message: "Video uploaded successfully" });
});
app.get('/', (req, res) => {
    res.json({ message: "Hello World" });
}); 

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});

