routerAdd('POST', '/api/otp/auth', (c) => {
  return require('pocketbase-otp/dist/main').AuthHandler(c)
})

routerAdd('POST', '/api/otp/verify', (c) => {
  return require('pocketbase-otp/dist/main').VerifyHandler(c)
})
