import jsonwebtoken from 'jsonwebtoken';
import userSchema from '../models/userSchema.js';
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No authentication token provided'
            });
        }
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET || 'research_only_secret_key');
        const user = await userSchema.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid authentication token'
            });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid authentication token'
        });
    }
};
export default authMiddleware;