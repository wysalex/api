const koa = require('koa')
const route = require('koa-route')
const cors = require('@koa/cors')

const app = new koa()
app.use(cors())

app.use(route.get('/', function () {
  this.body = { response: 'test' }
}))

app.listen(6666)

console.log('Api service is on...')
