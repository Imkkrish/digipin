const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const digipinRoutes = require('./routes/digipin.routes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

// const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
const swaggerDocument = YAML.parse(fs.readFileSync(path.join(__dirname, '../swagger.yaml'), 'utf8'));

const app = express();

// CORS Configuration - Allow all origins for API access
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Swagger Docs Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DIGIPIN API'
  });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'DIGIPIN API - Department of Posts, India',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health',
    endpoints: {
      encode: '/api/digipin/encode',
      decode: '/api/digipin/decode'
    }
  });
});

// DIGIPIN API Routes
app.use('/api/digipin', digipinRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      root: '/',
      health: '/health',
      docs: '/api-docs',
      encode: '/api/digipin/encode',
      decode: '/api/digipin/decode'
    }
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

module.exports = app;
