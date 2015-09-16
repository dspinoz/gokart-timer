module.exports = {

  port: process.env.PORT || 8080,
  title: 'GoKart Timer',
  pages: [],
  gpio: {
    led: 22,
    button: 23
  },
  file: { prefix: 'gpstest' }
  
}
