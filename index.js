/**
 * Api for Alex
 * Alex Wang <wysalexwang@gmail.com>
 */
'use strict'
const fs = require('fs')
const http = require('http')
const https = require('https')
const koa = require('koa')
const route = require('koa-route')
const cors = require('@koa/cors')

const movie = require('./components/movie');

const app = new koa()
app.use(cors())

app.use(route.get('/', function () {
  this.body = `/**
 * Api for Alex
 * Alex Wang <wysalexwang@gmail.com>
 */`
}))

app.use(route.get('/version', function () {
  this.body = { version: '0.0.1' }
}))

// movie
app.use(route.get('/movie', movie.list))
app.use(route.get('/movie/list', movie.list))
app.use(route.get('/movie/:id/:city', movie.fetch))

// listen http/https
const options = {
  key: fs.readFileSync('/etc/nginx/ssl/nginx.key', 'utf8'),
  cert: fs.readFileSync('/etc/nginx/ssl/nginx.crt', 'utf8')
}
// http.createServer(app.callback()).listen(8888)
https.createServer(options, app.callback()).listen(8888)
// app.listen(6666)

console.log('Api service is on...')
