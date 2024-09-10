import { dbg, error } from 'pocketbase-log'

/**
 * @typedef {Object} OtpPayload
 * @property {string?} email
 * @property {string?} returnUrl
 */

/**
 *
 * @param {echo.Context} c
 * @returns
 */
export const AuthHandler = (c) => {
  const TOKENS_TABLE = `plugin-otp-tokens`

  const dao = $app.dao()

  /**
   * @type {OtpPayload}
   */
  const parsed = (() => {
    const rawBody = readerToString(c.request().body)
    try {
      const parsed = JSON.parse(rawBody)
      return parsed
    } catch (e) {
      throw new BadRequestError(
        `Error parsing payload. You call this JSON? ${rawBody}`,
        e,
      )
    }
  })()
  const email = parsed.email?.trim()
  const returnUrl = parsed.returnUrl?.trim()

  dbg(`email: ${email}  `)
  dbg(`returnUrl: ${returnUrl}  `)

  const code = $security.randomStringWithAlphabet(6, `0123456789`)
  dbg(`otp: ${code}`)

  // Delete if exists
  try {
    const record = dao.findFirstRecordByData(TOKENS_TABLE, `email`, email)
    dao.deleteRecord(record)
  } catch (e) {
    error(`Error deleting record: ${e}`)
  }

  // Save the code

  try {
    const collection = dao.findCollectionByNameOrId(TOKENS_TABLE)
    const record = new Record(collection, {
      email,
      code,
    })
    dao.saveRecord(record)
    dbg(`*** otp record saved: ${record.id}`)
  } catch (e) {
    error(`Error saving otp: ${e}`)
    throw new BadRequestError(`Error saving otp: ${e}`)
  }

  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName,
    },
    to: [{ address: email }],
    subject: `Your login code`,
    text: `Your login code is: ${code}\n\n\n\nIf you didn't request this code, please ignore this email.`,
  })

  $app.newMailClient().send(message)

  return c.json(200, {
    message: `Please check your email for your 6-digit code.`,
  })
}

/**
 * @typedef {Object} OtpVerifyPayload
 *
 * @property {string} email
 * @property {string} code
 */

/**
 *
 * @param {echo.Context} c
 * @returns
 */
export const VerifyHandler = (c) => {
  const TOKENS_TABLE = `plugin-otp-tokens`
  const dao = $app.dao()

  /**
   * @type {OtpVerifyPayload}
   */
  const parsed = (() => {
    const rawBody = readerToString(c.request().body)
    try {
      const parsed = JSON.parse(rawBody)
      return parsed
    } catch (e) {
      throw new BadRequestError(
        `Error parsing payload. You call this JSON? ${rawBody}`,
        e,
      )
    }
  })()
  dbg(`***${JSON.stringify(parsed)}`)
  const email = parsed.email.trim()
  const code = parsed.code

  dbg(`***email: ${email} , code: ${code}`)

  try {
    const record = dao.findFirstRecordByData(TOKENS_TABLE, 'email', email)
    const storedCode = record.getString(`code`)
    if (storedCode !== code) {
      throw new BadRequestError(`Invalid code`)
    }
    const created = record.created.time().unixMilli()
    const now = Date.now()
    dbg(`***now:${now}  created:${created}`)
    if (now - created > 10 * 60 * 1000) {
      // 10 minutes
      throw new BadRequestError(`Code expired`)
    }
    dao.deleteRecord(record)
  } catch (e) {
    error(`Error confirming otp: ${e}`)
    throw e
  }

  const userRecord = (() => {
    try {
      return dao.findFirstRecordByData('users', 'email', email)
    } catch (e) {
      error(`Error finding user: ${e}`)
      const usersCollection = dao.findCollectionByNameOrId('users')
      const user = new Record(usersCollection)
      try {
        const username = $app
          .dao()
          .suggestUniqueAuthRecordUsername(
            'users',
            'user' + $security.randomStringWithAlphabet(5, '123456789'),
          )
        user.set('username', username)
        user.set('email', email)
        user.setPassword($security.randomString(20)) // Fake password (not used)
        dao.saveRecord(user)
      } catch (e) {
        throw new BadRequestError(`Could not create user: ${e}`)
      }
    }
  })()

  return $apis.recordAuthResponse($app, c, userRecord, null)
}
