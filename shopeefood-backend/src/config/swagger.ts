import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopeeFood Mini API Docs',
      version: '1.0.0',
      description: 'Tài liệu API cho dự án ShopeeFood Clone',
      contact: {
        name: 'Developer',
        email: 'em@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080/api/v1',
        description: 'Local Server',
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Chỉ định nơi chứa ghi chú API (Em sẽ viết chú thích ngay trong file routes)
  apis: ['./src/routes/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;