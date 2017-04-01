process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_MONGODB_URL = `mongodb://localhost:32123/anno`

const MongodbStore = require('./store-mongodb')
const store = new MongodbStore()
require('../anno-store/store-test')(store, () => {})
