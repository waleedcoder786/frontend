// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(express.json()); 

// // MongoDB Connection (Apna Connection String yahan dalein)
// mongoose.connect('mongodb+srv://waleedcoderz:waleedcoder123@test.bctaibf.mongodb.net/?appName=test');

// // Schema (Jo structure aapne bheja tha)
// const ClassSchema = new mongoose.Schema({}, { strict: false });
// const Class = mongoose.model('Class', ClassSchema);


// // User/Admin Schema
// const UserSchema = new mongoose.Schema({
//     id: String, // Frontend compatibility
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     password: { type: String, required: true },
//     phone: String,
//     institute: String,
//     address: String,
//     watermark: String,
//     logo: String,
//     role: { type: String, default: 'admin' },
//     profilePic: String
// }, { timestamps: true });

// const User = mongoose.model('User', UserSchema);

// // Teacher Schema
// const TeacherSchema = new mongoose.Schema({
//     id: String,
//     userId: String, // Admin ID
//     name: String,
//     subjects: [String],
//     classes: [String]
// }, { timestamps: true });

// const Teacher = mongoose.model('Teacher', TeacherSchema);


// // 1. Get All Classes (Dropdowns ke liye)
// app.get('/api/classes', async (req, res) => {
//     const classes = await Class.find({});
//     res.json(classes);
// });

// // 2. Add Question (The Main Logic)
// // ... (Express aur Mongoose setup same rahega)
// app.post('/api/add-question', async (req, res) => {
//     const { classId, subjectName, chapterName, newQuestion, type, category } = req.body;

//     try {
//         const filter = { "classes.id": classId };
//         const arrayFilters = [
//             { "cls.id": classId },
//             { "sub.name": subjectName },
//             { "ch.name": chapterName }
//         ];

//         // Type check: mcq -> MCQs, short -> shorts, long -> longs
//         const fieldName = type === 'mcq' ? 'MCQs' : type === 'short' ? 'shorts' : 'longs';

//         // NOTE: Agar aapke DB mein index [0] nahi hai, to niche se ".0" hata dein
//         // Example: `classes.$[cls].subjects.$[sub].chapters.$[ch].${fieldName}.${category}`
//         const updatePath = `classes.$[cls].subjects.$[sub].chapters.$[ch].${fieldName}.0.${category}`;

//         const updateQuery = { 
//             $push: { [updatePath]: newQuestion } 
//         };

//         const result = await Class.updateOne(filter, updateQuery, { arrayFilters });

//         if (result.matchedCount === 0) {
//             return res.status(404).json({ message: "Class/Subject/Chapter path not found." });
//         }

//         if (result.modifiedCount === 0) {
//             return res.status(400).json({ message: "Path found but category structure is missing in DB." });
//         }

//         res.status(200).send({ message: `Saved to ${category}!` });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: err.message });
//     }
// });



// app.get('/api/users', async (req, res) => {
//     try {
//         const users = await User.find({});
//         res.json(users);
//     } catch (err) { res.status(500).send(err); }
// });

// // Register Admin
// app.post('/api/users', async (req, res) => {
//     try {
//         const newUser = new User(req.body);
//         await newUser.save();
//         res.status(201).json(newUser);
//     } catch (err) { res.status(400).send(err); }
// });

// // Update Admin
// app.put('/api/users/:id', async (req, res) => {
//     try {
//         const updated = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
//         res.json(updated);
//     } catch (err) { res.status(400).send(err); }
// });

// // Delete Admin & Linked Teachers
// app.delete('/api/users/:id', async (req, res) => {
//     try {
//         await User.findOneAndDelete({ id: req.params.id });
//         await Teacher.deleteMany({ userId: req.params.id });
//         res.json({ message: "Deleted successfully" });
//     } catch (err) { res.status(500).send(err); }
// });

// // Get All Teachers
// app.get('/api/teachers', async (req, res) => {
//     try {
//         const teachers = await Teacher.find({});
//         res.json(teachers);
//     } catch (err) { res.status(500).send(err); }
// });

// // Delete Teacher
// app.delete('/api/teachers/:id', async (req, res) => {
//     try {
//         await Teacher.findOneAndDelete({ id: req.params.id });
//         res.json({ message: "Teacher deleted" });
//     } catch (err) { res.status(500).send(err); }
// });

// // --- LOGIN API ---
// app.post('/api/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         // 1. Pehle Users (Admins) mein check karein
//         const user = await User.findOne({ email });
//         if (user && user.password === password) {
//             return res.json({ type: 'user', data: user });
//         }

//         // 2. Phir Teachers mein check karein
//         const teacher = await Teacher.findOne({ email });
//         if (teacher && teacher.password === password) {
//             return res.json({ type: 'teacher', data: teacher });
//         }

//         res.status(401).json({ message: "Invalid Email or Password" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// app.listen(5000, () => console.log('Server running on port 5000'));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large paper data handle karne ke liye

// --- MONGODB CONNECTION ---
mongoose.connect('mongodb+srv://waleedcoderz:waleedcoder123@test.bctaibf.mongodb.net/?appName=test')
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ Connection Error:", err));

// --- SCHEMAS ---

const Class = mongoose.model('Class', new mongoose.Schema({}, { strict: false }));

const User = mongoose.model('User', new mongoose.Schema({
    id: String, 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    institute: String,
    address: String,
    watermark: String,
    logo: String,
    role: { type: String, default: 'admin' },
    profilePic: String
}, { timestamps: true }));

const Paper = mongoose.model('Paper', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paperName: String,
    paperType: String,
    paperDate: String,
    paperTime: String,
    className: String,
    subject: String,
    totalMarks: Number,
    batches: Array, // Questions and sections
    headerInfo: {
        schoolName: String,
        address: String,
        logo: String,
        watermark: String
    },
    // ADDED: Styling settings for Designer Panel
    style: {
        fontFamily: { type: String, default: "font-sans" },
        lineHeight: { type: String, default: "1.5" },
        headingSize: { type: String, default: "18" },
        textSize: { type: String, default: "14" },
        textColor: { type: String, default: "#000000" },
        watermark: { type: String, default: "CONFIDENTIAL" },
        showWatermark: { type: Boolean, default: true },
        showBubbleSheet: { type: Boolean, default: false },
        showNote: { type: Boolean, default: false },
        noteText: String,
        logoUrl: String,
        layoutType: { type: String, default: "default" },
    },
    createdAt: { type: Date, default: Date.now }
}));

const Teacher = mongoose.model('Teacher', new mongoose.Schema({
    id: String,
    userId: String,
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subjects: [String],
    classes: [String]
}, { timestamps: true }));

// --- ROUTES ---

// 1. LOGIN
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && user.password === password) return res.json({ type: 'user', data: user });

        const teacher = await Teacher.findOne({ email });
        if (teacher && teacher.password === password) return res.json({ type: 'teacher', data: teacher });

        res.status(401).json({ message: "Invalid credentials" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. QUESTION BANK LOGIC
app.get('/api/classes', async (req, res) => res.json(await Class.find({})));

app.post('/api/add-question', async (req, res) => {
    const { classId, subjectName, chapterName, newQuestion, type, category } = req.body;
    try {
        const fieldName = type === 'mcq' ? 'MCQs' : type === 'short' ? 'shorts' : 'longs';
        const updatePath = `classes.$[cls].subjects.$[sub].chapters.$[ch].${fieldName}.0.${category}`;
        await Class.updateOne(
            { "classes.id": classId },
            { $push: { [updatePath]: newQuestion } },
            { arrayFilters: [{ "cls.id": classId }, { "sub.name": subjectName }, { "ch.name": chapterName }] }
        );
        res.status(200).send({ message: "Saved successfully!" });
    } catch (err) { res.status(500).send({ error: err.message }); }
});

// 3. USER MANAGEMENT
app.get('/api/users', async (req, res) => res.json(await User.find({})));
app.post('/api/users', async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
});
app.delete('/api/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User Deleted" });
});

// 4. TEACHER MANAGEMENT
app.get('/api/teachers', async (req, res) => {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const teachers = await Teacher.find(filter);
    res.json(teachers);
});
app.post('/api/teachers', async (req, res) => {
    const newTeacher = new Teacher(req.body);
    await newTeacher.save();
    res.status(201).json(newTeacher);
});
app.delete('/api/teachers/:id', async (req, res) => {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: "Teacher deleted" });
});

// 5. PAPER MANAGEMENT (NEW & UPDATED)

// Create Paper
app.post('/api/papers', async (req, res) => {
    try {
        const newPaper = new Paper(req.body);
        await newPaper.save();
        res.status(201).json({ message: "Paper saved!", id: newPaper._id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get All Papers for User
// Get All Papers for User (Admin + his Teachers)
app.get('/api/papers', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // 1. Teachers dhoondein (Aapke schema mein field ka naam 'userId' hai na ke 'adminId')
        const teachers = await Teacher.find({ userId: userId }); 
        
        // 2. Teachers ki MongoDB IDs ki array banayein
        const teacherIds = teachers.map(t => t._id);

        // 3. Admin ki ID aur Teachers ki IDs ko ek array mein jama karein
        const allIds = [userId, ...teacherIds];

        // 4. Papers find karein
        // Note: Agar Paper model mein userId 'ObjectId' type hai, to MongoDB khud handle kar leta hai $in ke saath
        const papers = await Paper.find({ 
            userId: { $in: allIds } 
        }).sort({ createdAt: -1 });

        res.json(papers);
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Single Paper by ID
app.get("/api/papers/:id", async (req, res) => {
    try {
        const paper = await Paper.findById(req.params.id);
        paper ? res.json(paper) : res.status(404).json({ message: "Not found" });
    } catch (error) { res.status(500).json({ message: "Invalid ID" }); }
});

// *** IMPORTANT: Update Paper Route (For Editor/Designer) ***
app.put('/api/papers/:id', async (req, res) => {
    try {
        const updatedPaper = await Paper.findByIdAndUpdate(
            req.params.id,
            { $set: req.body }, // Yeh batches, styles aur header sab update karega
            { new: true }
        );
        res.json({ message: "Update Successful", data: updatedPaper });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete Paper
app.delete('/api/papers/:id', async (req, res) => {
    await Paper.findByIdAndDelete(req.params.id);
    res.json({ message: "Paper deleted" });
});


app.listen(5000, () => console.log('🚀 Server running on port 5000'));