const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Limit barha di gayi hai

// MongoDB Connection (Apna Connection String yahan dalein)
mongoose.connect('mongodb+srv://waleedcoderz:waleedcoder123@test.bctaibf.mongodb.net/?appName=test');

// Schema (Jo structure aapne bheja tha)
const ClassSchema = new mongoose.Schema({}, { strict: false });
const Class = mongoose.model('Class', ClassSchema);

// 1. Get All Classes (Dropdowns ke liye)
app.get('/api/classes', async (req, res) => {
    const classes = await Class.find({});
    res.json(classes);
});

// 2. Add Question (The Main Logic)
// ... (Express aur Mongoose setup same rahega)
app.post('/api/add-question', async (req, res) => {
    const { classId, subjectName, chapterName, newQuestion, type, category } = req.body;

    try {
        const filter = { "classes.id": classId };
        const arrayFilters = [
            { "cls.id": classId },
            { "sub.name": subjectName },
            { "ch.name": chapterName }
        ];

        // Type check: mcq -> MCQs, short -> shorts, long -> longs
        const fieldName = type === 'mcq' ? 'MCQs' : type === 'short' ? 'shorts' : 'longs';

        // NOTE: Agar aapke DB mein index [0] nahi hai, to niche se ".0" hata dein
        // Example: `classes.$[cls].subjects.$[sub].chapters.$[ch].${fieldName}.${category}`
        const updatePath = `classes.$[cls].subjects.$[sub].chapters.$[ch].${fieldName}.0.${category}`;

        const updateQuery = { 
            $push: { [updatePath]: newQuestion } 
        };

        const result = await Class.updateOne(filter, updateQuery, { arrayFilters });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Class/Subject/Chapter path not found." });
        }

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: "Path found but category structure is missing in DB." });
        }

        res.status(200).send({ message: `Saved to ${category}!` });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));