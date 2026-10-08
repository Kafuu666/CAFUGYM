class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Pastikan parameter :id berupa bilangan bulat positif.
const validateIdParam = (req, res, next, value) =>
  /^[1-9]\d*$/.test(value) ? next() : next(new ApiError(400, 'ID tidak valid.'));

module.exports = { ApiError, asyncHandler, validateIdParam };
