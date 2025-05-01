import bcrypt from 'bcrypt';
import supabase from '../supabase.js';
import { generateToken } from '../utils/jwtUtils.js';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database
        const { data, error } = await supabase
            .from('users')
            .insert([
                { name, email, password: hashedPassword }
            ])
            .select()
            .single();

        if (error) throw error;

        // Generate JWT
        const token = generateToken(data.id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: data.id,
                name: data.name,
                email: data.email
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};