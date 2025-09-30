const { Room, User, Booking, Review } = require('../models');
const { toCSV } = require('../utils/csv.service');

exports.createRoom = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photoUrl = `/uploads/${req.file.filename}`;
    const room = await Room.create(data);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

exports.listRooms = async (req, res, next) => {
  try {
    const rooms = await Room.findAll();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'ROOM_NOT_FOUND' });
    const data = { ...req.body };
    if (req.file) data.photoUrl = `/uploads/${req.file.filename}`;
    await room.update(data);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'ROOM_NOT_FOUND' });
    await room.destroy();
    res.json({ message: 'DELETED' });
  } catch (error) {
    next(error);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND' });
    await user.update(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND' });
    await user.destroy();
    res.json({ message: 'DELETED' });
  } catch (error) {
    next(error);
  }
};

exports.listBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({ include: [Room, User] });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

exports.exportBookingsCSV = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({ include: [Room, User] });
    const plain = bookings.map((b) => b.get({ plain: true }));
    const csv = toCSV(plain);
    res.setHeader('Content-Type', 'text/csv');
    res.attachment('bookings.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

exports.listReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: Booking },
        { model: User, as: 'User' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'REVIEW_NOT_FOUND' });
    await review.destroy();
    res.json({ message: 'DELETED' });
  } catch (error) {
    next(error);
  }
}; 
