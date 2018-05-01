'use strict'
const request = require('request')
const cheerio = require('cheerio')

module.exports.list = async (ctx) => {
  const getMovieList = () => {
    return new Promise((resolve, reject) => {
      let films = []
      request('http://www.atmovies.com.tw/movie/now/', (err, res, body) => {
        const $ = cheerio.load(body)
        $('.filmListAll2 > li > a').map((index, element) => {
          const $element = $(element)
          let temp = $element.attr('href').split('/')
          temp.pop()
          films.push({
            name: $element.text(),
            key: temp.pop(),
          })
        })
        resolve(films)
      })
    })
  }
  let list = await getMovieList()
  ctx.body = {
    films: list
  }
}

module.exports.fetch = async (ctx, movie, city) => {
  const getMovieTime = () => {
    return new Promise(async (resolve, reject) => {
      const filmId = await getFilmId(movie)
      const cityId = await getCityId(city)
      if (filmId === '' || cityId === '') {
        resolve([])
        return
      }
      let times = []
      request(`http://www.atmovies.com.tw/showtime/${filmId}/${cityId}/`, (err, res, body) => {
        const $ = cheerio.load(body)
        const d = new Date()
        const hour = d.getHours()
        const minute = d.getMinutes()
        $('#filmShowtimeBlock > ul > li')
          .filter((index, element) => {
            let time = $(element).text().split('：')
            return time[0] * 60 + time[1] * 1 > hour * 60 + minute * 1
          })
          .map((index, element) => {
            times.push({
              time: $(element).text(),
              theater: $(element).closest('ul').find('.theaterTitle').text()
            })
          })
        resolve(times)
      })
    })
  }
  let times = await getMovieTime()
  if (times.length > 0) {
    ctx.body = times
  } else {
    ctx.response.status = 404
    ctx.body = 'Not Found'
  }
}

const getFilmId = async movie => {
  return new Promise((resolve, reject) => {
    request('http://www.atmovies.com.tw/movie/now/', (err, res, body) => {
      const $ = cheerio.load(body)
      const re = new RegExp(movie, "i")
      var filmUrl = $('select[name=filmselect] option').filter((index, obj) => {
        return re.test($(obj).text())
      }).val()
      if (!!filmUrl) {
        let filmFullUrl = filmUrl.split('/')
        filmFullUrl.pop()
        resolve(filmFullUrl.pop())
      } else {
        resolve('')
      }
    })
  })
}

const getCityId = async city => {
  return new Promise((resolve, reject) => {
    request('http://www.atmovies.com.tw/showtime/', (err, res, body) => {
      const $ = cheerio.load(body)
      const re = new RegExp(city, "i")
      let cityId = ''
      let citys = $('.theaterArea > li > a')
      Object.keys(citys).forEach(cityIdx => {
        const $city = $(citys[cityIdx])
        if (re.test($city.text()) && $city.attr('href')) {
          let temp = $city.attr('href').split('/')
          temp.pop()
          cityId = temp.pop()
        }
      })
      resolve(cityId)
    })
  })
}
