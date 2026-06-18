const successResponse = (res, statusCode, message, data = null, meta = undefined) => {
  const payload = {
    success: true,
    message
  };

  if (data !== null) {
    payload.data = data;
  }

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

const errorResponse = (res, statusCode, message, details = undefined) => {
  const payload = {
    success: false,
    message
  };

  if (details) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse
};
