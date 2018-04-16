const responseScheme = require('../response-scheme')

module.exports = {
  paginate (req, res, next) {
    let { data, count, page, size } = res.states

    let response = {
      pagination: {
        page_information: {
          number: page,
          size: size
        },
        first: 0,
        last: 0,
        total_number_of_page: Math.ceil(count / size) || 1,
        total_number_of_entities: count
      },
      data: data.map(datum => responseScheme(datum, req))
    }

    if (data.length > 0 && count > 0) {
      let indexOffset = (page - 1) * size
      response.pagination.first = indexOffset + 1
      response.pagination.last = indexOffset + data.length
    }

    return res.json(response)
  },

  response (req, res, next) {
    let { data } = res.states
    if (data instanceof Array) {
      return res.json({
        data: data.map(datum => responseScheme(datum, req))
      })
    } else {
      return res.json(responseScheme(data, req))
    }
  },

  errorHandler (err, req, res, next) {

  }
}
