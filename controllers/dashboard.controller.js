const { User, Property, Booking, Review, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Get dashboard statistics
 * GET /admin/dashboard/stats
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { period = 'daily', compare_previous = false } = req.query;

    // Calculate date ranges
    const now = new Date();
    let startDate, previousStartDate;
    
    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      default: // daily
        startDate = new Date(now.setHours(0, 0, 0, 0));
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 1);
    }

    // Get current period metrics
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      activeBookings,
      pendingReviews,
      totalRevenue,
      previousRevenue,
      previousBookings,
      previousUsers,
      paymentMethodStats,
      bookingStats,

      // User statistics by role
      User.findAll({
        attributes: [
          'roleId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('MAX', sequelize.col('createdAt')), 'last_signup']
        ],
        include: [{ model: Role, attributes: ['name'] }],
        group: ['roleId', 'Role.name']
      }),

      // Property statistics by type
      Property.findAll({
        attributes: [
          'type_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('AVG', sequelize.col('price')), 'avg_price']
        ],
        include: [{ model: PropertyType, as: 'PropertyType', attributes: ['name'] }],
        group: ['type_id', 'PropertyType.name']
      }),

      // Review statistics
      Review.findAll({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_reviews'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating >= 4 THEN 1 END')), 'positive_reviews'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating <= 2 THEN 1 END')), 'negative_reviews']
        ],
        where: {
          createdAt: { [Op.gte]: startDate }
        }
      }),

      // Top performing properties
      Property.findAll({
        attributes: [
          'id',
          'name',
          [sequelize.fn('COUNT', sequelize.col('Bookings.id')), 'booking_count'],
          [sequelize.fn('SUM', sequelize.col('Bookings.total_amount')), 'total_revenue']
        ],
        include: [
          { 
            model: Booking,
            as: 'Bookings',
            attributes: [],
            where: {
              createdAt: { [Op.gte]: startDate },
              status: { [Op.ne]: 'cancelled' }
            }
          }
        ],
        group: ['Property.id'],
        order: [[sequelize.fn('SUM', sequelize.col('Bookings.total_amount')), 'DESC']],
        limit: 5
      }),

      // Recent bookings with user and property details
      Booking.findAll({
        attributes: ['id', 'total_amount', 'status', 'createdAt'],
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { 
            model: Property,
            as: 'PropertyBooking',
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      }),
      // New metrics
      userStats,
      propertyStats,
      reviewStats,
      topProperties,
      recentBookings
    ] = await Promise.all([
      // Overview metrics
      User.count({ where: { isActive: true } }),
      Property.count({ where: { isActive: true } }),
      Booking.count({ where: { createdAt: { [Op.gte]: startDate } } }),
      Booking.count({ where: { status: 'active' } }),
      Review.count({ where: { status: 'pending' } }),

      // Current period revenue
      Booking.sum('total_amount', { 
        where: { 
          createdAt: { [Op.gte]: startDate },
          status: { [Op.ne]: 'cancelled' }
        }
      }),

      // Previous period metrics for comparison
      compare_previous ? Booking.sum('total_amount', {
        where: {
          createdAt: {
            [Op.gte]: previousStartDate,
            [Op.lt]: startDate
          },
          status: { [Op.ne]: 'cancelled' }
        }
      }) : 0,
      compare_previous ? Booking.count({
        where: {
          createdAt: {
            [Op.gte]: previousStartDate,
            [Op.lt]: startDate
          }
        }
      }) : 0,
      compare_previous ? User.count({
        where: {
          createdAt: {
            [Op.gte]: previousStartDate,
            [Op.lt]: startDate
          }
        }
      }) : 0,

      // Payment method distribution
      Booking.findAll({
        attributes: [
          'payment_method',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
        ],
        where: {
          createdAt: { [Op.gte]: startDate }
        },
        group: ['payment_method']
      }),

      // Booking statistics
      Booking.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_amount']
        ],
        where: {
          createdAt: { [Op.gte]: startDate }
        },
        group: ['status']
      })
    ]);

    // Calculate growth rates
    const calculateGrowth = (current, previous) => {
      if (!previous) return 0;
      return ((current - previous) / previous) * 100;
    };

    // Format payment methods stats
    const paymentMethods = paymentMethodStats.reduce((acc, stat) => {
      acc[stat.payment_method] = {
        count: parseInt(stat.get('count')),
        total: parseFloat(stat.get('total'))
      };
      return acc;
    }, {});

    // Calculate operational metrics
    const bookingMetrics = bookingStats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: parseInt(stat.get('count')),
        avg_amount: parseFloat(stat.get('avg_amount'))
      };
      return acc;
    }, {});

    const totalBookingCount = Object.values(bookingMetrics).reduce((sum, { count }) => sum + count, 0);
    const cancellationRate = totalBookingCount ? 
      (bookingMetrics.cancelled?.count || 0) / totalBookingCount * 100 : 0;

    // Prepare response
    res.json({
      success: true,
      data: {
        overview: {
          total_users: totalUsers,
          total_properties: totalProperties,
          total_bookings: totalBookings,
          total_revenue: totalRevenue || 0,
          active_bookings: activeBookings,
          pending_reviews: pendingReviews,
          system_uptime: process.uptime(),
          last_update: new Date().toISOString()
        },
        growth_metrics: {
          user_growth: {
            current_period: totalUsers,
            previous_period: previousUsers,
            growth_rate: calculateGrowth(totalUsers, previousUsers)
          },
          revenue_growth: {
            current_period: totalRevenue || 0,
            previous_period: previousRevenue || 0,
            growth_rate: calculateGrowth(totalRevenue, previousRevenue)
          },
          booking_growth: {
            current_period: totalBookings,
            previous_period: previousBookings,
            growth_rate: calculateGrowth(totalBookings, previousBookings)
          }
        },
        financial_summary: {
          total_revenue: totalRevenue || 0,
          pending_payments: bookingMetrics.pending?.count || 0,
          refunds_issued: bookingMetrics.refunded?.count || 0,
          commission_earned: (totalRevenue || 0) * 0.1, // Assuming 10% commission
          payment_methods: paymentMethods
        },
        operational_metrics: {
          average_booking_value: Object.values(bookingMetrics).reduce((sum, { avg_amount }) => sum + (avg_amount || 0), 0) / Object.keys(bookingMetrics).length,
          occupancy_rate: (activeBookings / totalProperties) * 100,
          booking_cancellation_rate: cancellationRate,
          total_bookings_by_status: bookingMetrics
        },
        user_metrics: {
          by_role: userStats.map(stat => ({
            role: stat.Role.name,
            count: parseInt(stat.get('count')),
            last_signup: stat.get('last_signup')
          }))
        },
        property_metrics: {
          by_type: propertyStats.map(stat => ({
            type: stat.PropertyType.name,
            count: parseInt(stat.get('count')),
            avg_price: parseFloat(stat.get('avg_price'))
          })),
          top_performers: topProperties.map(prop => ({
            id: prop.id,
            name: prop.name,
            booking_count: parseInt(prop.get('booking_count')),
            total_revenue: parseFloat(prop.get('total_revenue'))
          }))
        },
        review_metrics: {
          average_rating: parseFloat(reviewStats[0]?.get('avg_rating') || 0),
          total_reviews: parseInt(reviewStats[0]?.get('total_reviews') || 0),
          positive_reviews: parseInt(reviewStats[0]?.get('positive_reviews') || 0),
          negative_reviews: parseInt(reviewStats[0]?.get('negative_reviews') || 0),
          satisfaction_rate: reviewStats[0]?.get('total_reviews') ? 
            (parseInt(reviewStats[0]?.get('positive_reviews')) / parseInt(reviewStats[0]?.get('total_reviews'))) * 100 : 0
        },
        recent_activity: {
          latest_bookings: recentBookings.map(booking => ({
            id: booking.id,
            amount: booking.total_amount,
            status: booking.status,
            created_at: booking.createdAt,
            user: {
              id: booking.User.id,
              name: booking.User.name,
              email: booking.User.email
            },
            property: {
              id: booking.PropertyBooking.id,
              name: booking.PropertyBooking.name
            }
          }))
        }
      }
    });

  } catch (error) {
    logger.error('Error getting dashboard stats: %o', error);
    next(error);
  }
};
