const notFoundHandler = (request, response, next) => {
  response.status(404)
  next(new Error(`Route not found: ${request.originalUrl}`))
}

const errorHandler = (error, _request, response, next) => {
  void next
  const statusCode =
    error.statusCode || (response.statusCode >= 400 ? response.statusCode : 500)

  response.status(statusCode).json({
    message: error.message || 'Unexpected server error',
  })
}

export { errorHandler, notFoundHandler }
