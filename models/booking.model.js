const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending',
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded'),
      defaultValue: 'pending',
      comment: 'حالة الدفع',
    },
    couponCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    originalAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    discountAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    finalAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Properties',
        key: 'id'
      },
      comment: 'العقار المحجوز (الجديد)',
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'السعر الكامل للحجز',
    },
    deposit_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'المقدم المطلوب',
    },
    deposit_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'المقدم المدفوع',
    },
    remaining_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'المبلغ المتبقي',
    },
    payment_method: {
      type: DataTypes.ENUM('mada', 'visa', 'mastercard', 'apple_pay', 'stc_pay', 'cash'),
      allowNull: true,
      comment: 'وسيلة الدفع',
    },
    payment_reference: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'مرجع عملية الدفع',
    },
    check_in: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'تاريخ ووقت الوصول',
    },
    check_out: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'تاريخ ووقت المغادرة',
    },
    guest_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'عدد الضيوف',
    },
    special_requests: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'طلبات خاصة',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'ملاحظات إدارية',
    },
  });
  return Booking;
}; 