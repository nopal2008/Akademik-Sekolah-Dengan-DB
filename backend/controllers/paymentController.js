// controllers/paymentController.js
const { Payment, Student, Parent } = require('../models');

// Helper to map DB status values to Frontend terms
const mapStatusToFrontend = (status) => {
  if (status === 'paid') return 'Lunas';
  if (status === 'pending') return 'Pending';
  return status;
};

// Helper to map Frontend terms to DB ENUM values
const mapStatusToBackend = (status) => {
  if (status === 'Lunas' || status === 'paid') return 'paid';
  if (status === 'Pending' || status === 'Belum Lunas' || status === 'pending') return 'pending';
  return status;
};

const getFullUrl = (url, req) => {
  if (!url || !req) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (!url.startsWith('/')) return url;
  return `${req.protocol}://${req.get('host')}${url}`;
};

// Helper to format a single payment instance before returning
const formatPayment = (payment, req) => {
  if (!payment) return null;
  const data = payment.toJSON ? payment.toJSON() : payment;
  if (data.status) {
    data.status = mapStatusToFrontend(data.status);
  }
  if (data.receipt_url) {
    data.receipt_url = getFullUrl(data.receipt_url, req);
  }
  return data;
};

// Create payment (hanya admin/guru? tapi di sini kita izinkan parent membuat payment record)
exports.createPayment = async (req, res, next) => {
  try {
    const { student_id, parent_id, amount, due_date, description } = req.body;
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Ambil parent_id dari body atau otomatis dari data student
    const finalParentId = parent_id || student.parent_id;
    const parent = await Parent.findByPk(finalParentId);

    if (!parent) {
      return res.status(404).json({ message: 'Parent for this student not found. Siswa harus memiliki orang tua untuk ditagih.' });
    }
    // jika user login adalah parent, pastikan parent_id sesuai dengan yang login
    if (req.userRole === 'parent' && req.user.id !== finalParentId) {
      return res.status(403).json({ message: 'You can only create payments for yourself' });
    }
    const payment = await Payment.create({
      student_id, parent_id: finalParentId, amount, due_date, description,
      status: 'pending'
    });
    res.status(201).json({ success: true, data: formatPayment(payment, req) });
  } catch (err) {
    next(err);
  }
};

// Get all payments (admin/teacher) atau berdasarkan parent/student
exports.getPayments = async (req, res, next) => {
  try {
    let where = {};
    if (req.userRole === 'student') {
      where.student_id = req.user.id;
    } else if (req.userRole === 'parent') {
      where.parent_id = req.user.id;
    } else if (req.userRole === 'teacher' || req.userRole === 'admin') {
      // teacher/admin bisa lihat semua
      if (req.query.student_id) where.student_id = req.query.student_id;
    }
    const payments = await Payment.findAll({
      where,
      include: [
        { model: Student, attributes: ['id', 'name', 'nis'] },
        { model: Parent, attributes: ['id', 'name'] }
      ],
      order: [['due_date', 'ASC']]
    });
    res.json({ success: true, data: payments.map((payment) => formatPayment(payment, req)) });
  } catch (err) {
    next(err);
  }
};

// Get single payment
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [Student, Parent]
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    // Cek akses
    if (req.userRole === 'student' && payment.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.userRole === 'parent' && payment.parent_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ success: true, data: formatPayment(payment, req) });
  } catch (err) {
    next(err);
  }
};

// Update payment status (admin/teacher/parent bisa konfirmasi? kita batasi teacher dan admin)
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, method, payment_date, transaction_id } = req.body;
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Hanya teacher, admin atau parent sendiri yang bisa update
    const isTeacherOrAdmin = req.userRole === 'teacher' || req.userRole === 'admin';
    const isOwnParent = req.userRole === 'parent' && String(payment.parent_id) === String(req.user.id);
    if (!isTeacherOrAdmin && !isOwnParent) {
      return res.status(403).json({ message: 'Not authorized to update your own payment' });
    }

    const mappedStatus = mapStatusToBackend(status || (req.file ? 'Lunas' : payment.status));
    const receiptUrl = req.file ? `/uploads/payments/${req.file.filename}` : payment.receipt_url;

    await payment.update({
      status: mappedStatus,
      method,
      payment_date: payment_date || new Date(),
      transaction_id,
      receipt_url: receiptUrl
    });
    res.json({ success: true, data: formatPayment(payment, req) });
  } catch (err) {
    next(err);
  }
};

// Delete payment (hanya admin/teacher)
exports.deletePayment = async (req, res, next) => {
  try {
    if (req.userRole !== 'teacher' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only teacher or admin can delete payments' });
    }
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    await payment.destroy();
    res.json({ success: true, message: 'Payment deleted' });
  } catch (err) {
    next(err);
  }
};