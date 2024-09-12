routerAdd('POST', '/api/otp/auth', (c) => {
  return require('pocketbase-otp').AuthHandler(c)
})

routerAdd('POST', '/api/otp/verify', (c) => {
  return require('pocketbase-otp').VerifyHandler(c)
})
