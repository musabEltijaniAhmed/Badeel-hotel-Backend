const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const i18n = require('./utils/i18n');
const logger = require('./utils/logger');
const { sequelize, connectWithRetry } = require('./models'); 
 
// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const rolesRoutes = require('./routes/roles.routes');
const propertyRoutes = require('./routes/property.routes');
const staticPageRoutes = require('./routes/staticPage.routes');

const errorMiddleware = require('./middlewares/error.middleware');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Response helper middleware
const responseMiddleware = require('./utils/response.middleware');
app.use(responseMiddleware);
app.use(i18n.init);
 app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
 
// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// API Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', rolesRoutes); // إدارة الأدوار والصلاحيات
app.use('/properties', propertyRoutes); // إدارة العقارات
app.use('/pages', staticPageRoutes); // الصفحات الثابتة

// Error Handler
app.use(errorMiddleware);

// Sync DB in development (optional)
connectWithRetry().then(() => {
  if (process.env.NODE_ENV !== 'production') {
    sequelize.sync().then(() => logger.info('Database synced'));
  }
});

module.exports = app; 