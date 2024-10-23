

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import HttpStatus from 'http-status'; 
import AdminModel from '../Models/admin.js';

const secret_key = process.env.SECRET_KEY || '1234'; 


// Middleware to verify JWT and check if the user session is valid
export const authBearer = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Authorization Header Missing' });
        }

        const [authType, authToken] = authorization.split(' ');

        if (!authType || authType !== 'Bearer') {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid Authorization Type' });
        }

        if (!authToken) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Authorization Token Missing' });
        }

        // Verify the token
        const decoded = jwt.verify(authToken, secret_key);

        // Find the user by ID in the token payload
        const oldUser = await AdminModel.findById(decoded.id);
        if (!oldUser) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'User not found' });
        }

        // Find the specific admin info object
        const adminInfo = oldUser.adminInfo.find(info => info.email === decoded.email);
        if (!adminInfo) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Admin information not found' });
        }

        // Attach the user information to the request for further use in the route
        req.user = { id: oldUser._id, email: adminInfo.email };

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error in authBearer:', error);
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const oldUser = await AdminModel.findOne({ 'adminInfo.email': email });
        if (!oldUser) {
            return res.status(HttpStatus.NOT_FOUND).json({ message: 'User does not exist' });
        }

        const adminInfo = oldUser.adminInfo.find(info => info.email === email);
        if (!adminInfo) {
            return res.status(HttpStatus.NOT_FOUND).json({ message: 'Admin information not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, adminInfo.password);
        if (!isPasswordCorrect) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Password is incorrect' });
        }

        const token = jwt.sign(
            { email: adminInfo.email, id: oldUser._id },
            secret_key,
            { expiresIn: '24h' }
        );

        res.status(HttpStatus.OK).json({ result: adminInfo, token });
    } catch (err) {
        console.error('Error in signin:', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong in signin' });
    }
};

export const signup = async (req, res) => {
    console.log('Signup request body:', req.body);
    const {  name, email, password, role } = req.body;
    try {
        const oldUser = await AdminModel.findOne({ 'adminInfo.email': email });
        if (oldUser) {
            
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new AdminModel({
            adminInfo: [{
                name: name.toLowerCase(),
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
                createdAt: new Date() 
            }]
        });



        // const admins = await AdminModel.find().sort({ order: 1 }).exec(); // Ascending order
 // Save the new admin to the database
 await newAdmin.save(); // <--- Save to the database

        const token = jwt.sign(
            { id: newAdmin._id, email: email.toLowerCase() },
            secret_key,
            { expiresIn: '24h' }
        );

        res.status(HttpStatus.CREATED).json({ result: newAdmin, token });
    } catch (err) {
        console.error('Error in signup:', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong in the signup process' });
    }
};
