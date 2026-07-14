const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: message,
    details: err.details || undefined,
  });
}

module.exports = { notFoundHandler, errorHandler };
