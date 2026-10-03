// routes/paymentRoutes.js
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const paymentController = require('../controllers/paymentController');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'payments');
fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Semua route di bawah harus login
router.use(authMiddleware);

// GET /api/payments - Lihat daftar pembayaran (bergantung role)
router.get('/', paymentController.getPayments);

// GET /api/payments/:id - Detail pembayaran
router.get('/:id', paymentController.getPaymentById);

// POST /api/payments - Membuat pembayaran baru (parent atau teacher boleh)
router.post('/', roleCheck('parent', 'teacher'), paymentController.createPayment);

// PUT /api/payments/:id - Update status (teacher, admin, or parent owner)
router.put('/:id', upload.single('receipt'), paymentController.updatePaymentStatus);

// DELETE /api/payments/:id - Hanya teacher
router.delete('/:id', roleCheck('teacher'), paymentController.deletePayment);

module.exports = router;