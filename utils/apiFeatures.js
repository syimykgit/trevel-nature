/////////////////////////////// CLASS ////////////////////////////////
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedQuerys = ['sort', 'page', 'fields', 'limit'];
    excludedQuerys.forEach((el) => delete queryObj[el]);

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortStr = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortStr);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      const fieldStr = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldStr);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const pageNam = +this.queryString.page || 1;
    const limitNum = +this.queryString.limit || 100;
    const skip = (pageNam - 1) * limitNum;
    this.query.skip(skip).limit(limitNum);
    return this;
  }
}

module.exports = APIFeatures;
