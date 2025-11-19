import { Router } from 'express';
import { validateUser } from '../middleware/validation.js';
import { register, login } from '../controllers/authController.js';

const router = Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/logout', (req, res) => {
  res.clearCookie('token'); 
  res.redirect('/auth/login'); 
});

router.post('/register', validateUser, register);
router.post('/login', login);
export default router;