process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_NEDB_DIR = `${__dirname}/../temp`

const NedbStore = require('./store-nedb')
const store = new NedbStore()
require(`${__dirname}/../testlib/store-test`)(store, (err) => {
    console.log("# store-test finished")
})