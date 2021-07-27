const asyncHandler = require('./async');

const advancedResult = (model, populate) =>
  asyncHandler(async (req, res, next) => {
    let query;

    // Make copy of query
    let reqQuery = { ...req.query };

    // Remove specific fields from query
    const fields = ['select', 'sort', 'page', 'limit'];
    fields.forEach((field) => delete reqQuery[field]);

    // Make query string
    let queryStr = JSON.stringify(reqQuery);

    // Replace certain word to add $
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Building query
    query = model.find(JSON.parse(queryStr));

    // Select
    if (req.query.select) {
      query = query.select(req.query.select.split(',').join(' '));
    }

    // Sort
    if (req.query.sort) {
      query = query.sort(req.query.sort.split(',').join(' '));
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const limit = parseInt(req.query.limit, 10) || 25;
    const page = parseInt(req.query.page, 10) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = (await model.find().countDocuments()) - limit * page;
    query = query.skip(startIndex).limit(limit);

    // Populate
    if (populate) {
      query = query.populate(populate);
    }

    // Add pagination obj
    const pagination = {};

    if (endIndex > 0) {
      pagination.next = page + 1;
    }

    if (startIndex > 0) {
      pagination.prev = page - 1;
    }

    const results = await query;

    // Add response obj
    res.advancedResult = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };

    next();
  });

module.exports = advancedResult;
