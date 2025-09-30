const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Room Booking API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
            phone: { type: 'string', example: '+1234567890' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        ForgotPasswordInput: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', example: 'john@example.com' },
          },
        },
        ResetPasswordInput: {
          type: 'object',
          required: ['phone', 'otp', 'newPassword', 'confirmPassword'],
          properties: {
            phone: { type: 'string', example: '+966501234567' },
            otp: { type: 'string', example: '123456' },
            newPassword: { type: 'string', example: 'newpassword123' },
            confirmPassword: { type: 'string', example: 'newpassword123' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication routes' },
      { name: 'Admin', description: 'Admin routes' },
      { name: 'User', description: 'User routes' },
      { name: 'Booking', description: 'Booking routes' },
      { name: 'Room', description: 'Room routes' },
    ],
  },
  apis: ['./docs/swagger/*.yaml'], // external YAML docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec; 