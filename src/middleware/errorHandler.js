function errorHandler(err, _req, res, _next) {
  const status = err.statusCode ?? 500;
  const code = err.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST');
  const message = status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: { code, message } });
}

module.exports = { errorHandler };