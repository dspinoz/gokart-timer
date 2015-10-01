module.exports = {

  port: process.env.PORT || 8080,
  title: 'GoKart Timer',
  pages: [],
  gpio: {
    led: 22,
    button: 23
  },
  web: {
    buffer: 5
  },
  gps: {
    buffer: 100
  },
  output: { 
    type: 'json', // json or bson
    prefix: 'gpstest' 
  }
  
}
