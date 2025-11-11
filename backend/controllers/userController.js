import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken';

const createToken = (_id) =>
  jwt.sign({ _id }, process.env.SECRET, { expiresIn: '1d' });

// POST /api/user/signup
export const signupUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // basic validation
    if (!email || !password) throw new Error('Email and password are required');
    if (!validator.isEmail(email)) throw new Error('Invalid email');
    if (password.length < 8) throw new Error('Password must be at least 8 characters');

    // unique email
    const exists = await User.findOne({ email });
    if (exists) throw new Error('Email already in use');

    // hash and create
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      hashPassword: hash,           // store the hash in your model field
      name: name ?? '',
      settings: { remindDays: 0, channels: [] },
    });

    const token = createToken(user._id);
    res.status(200).json({ email: user.email, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/user/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new Error('Email and password are required');

    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const ok = await bcrypt.compare(password, user.hashPassword);
    if (!ok) throw new Error('Invalid credentials');

    const token = createToken(user._id);
    res.status(200).json({ email: user.email, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {           
  try {                                              
    const user = await User.findById(req.userId)     
      .select('email name settings creationTime')    
      .lean();                                       
    if (!user) return res.status(404).json({ error: 'User not found' }) 
    res.json(user)                                   
  } catch (err) {                                    
    res.status(400).json({ error: err.message })     
  }                                                  
}