import express from 'express';
import mongoose from 'mongoose';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cors from "cors";
// import { Plan } from './extras/plans.js';

const app = express();
const port = 5000;

// app.use(express.json());
app.use(bodyParser.json())
app.use(cors())

const MONGO_URI = "mongodb+srv://testUser:testing123@cluster0.v9sqjv6.mongodb.net/UserInfo?retryWrites=true&w=majority"

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Database Connected!")
    })

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(req.body);

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await hash(password, saltRounds);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id }, 'klkjasdfajdsopifiuasodfnaklkjhzsjkd', { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, 'klkjasdfajdsopifiuasodfnaklkjhzsjkd');

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

// app.get('/plans', async (req, res) => {
//     const plans = Plan.find();
//     console.log(plans)
//     res.json(plans)
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
