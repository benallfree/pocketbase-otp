/**
 * @type {import('pocodex').PluginFactory}
 */
const plugin = ({ migrate, log }) => {
  return {
    init(dao) {
      const { error } = log
      dbg({ routerAdd })

      routerAdd('POST', '/api/otp/auth', (c) => {
        return require('pocketbase-otp/dist/main').AuthHandler(c)
      })
      routerAdd('POST', '/api/otp/verify', (c) => {
        return require('pocketbase-otp/dist/main').VerifyHandler(c)
      })
    },
    install() {},
    uninstall() {},
    files() {
      return {}
    },
    migrations() {
      return {
        create_otp_table: migrate(
          (db) => {
            const collection = new Collection({
              id: 's3ezh62e61vy0ks',
              created: '2024-07-15 07:20:49.229Z',
              updated: '2024-07-15 07:20:49.229Z',
              name: 'pocketbase-otp-tokens',
              type: 'base',
              system: false,
              schema: [
                {
                  system: false,
                  id: 'y5vzwab0',
                  name: 'email',
                  type: 'email',
                  required: false,
                  presentable: false,
                  unique: false,
                  options: {
                    exceptDomains: null,
                    onlyDomains: null,
                  },
                },
                {
                  system: false,
                  id: 'kbryaqyk',
                  name: 'code',
                  type: 'text',
                  required: true,
                  presentable: false,
                  unique: false,
                  options: {
                    min: 6,
                    max: 6,
                    pattern: '^\\d{6}$',
                  },
                },
              ],
              indexes: [
                'CREATE INDEX `idx_xUoTrf5` ON `otp` (\n  `email`,\n  `code`\n)',
                'CREATE INDEX `idx_guKleJD` ON `otp` (`email`)',
                'CREATE INDEX `idx_fUk039Z` ON `otp` (`code`)',
              ],
              listRule: null,
              viewRule: null,
              createRule: null,
              updateRule: null,
              deleteRule: null,
              options: {},
            })

            return Dao(db).saveCollection(collection)
          },
          (db) => {
            const dao = new Dao(db)
            const collection = dao.findCollectionByNameOrId('s3ezh62e61vy0ks')

            return dao.deleteCollection(collection)
          },
        ),
      }
    },
  }
}

export { plugin }