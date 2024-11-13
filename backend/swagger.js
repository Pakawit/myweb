const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// การตั้งค่า Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for the project',
      contact: {
        name: 'Your Name',
        email: 'your.email@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:4452', // URL ของเซิร์ฟเวอร์
      },
    ],
  },
  apis: ['./server.js'], // ระบุไฟล์ที่มีคอมเมนต์ API
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
