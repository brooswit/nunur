const NunurServer = require('./src/nunurServer')
const nunurServer = new NunurServer()

nunurServer.express.use(express.static(path.join(__dirname, 'src/build')))
nunurServer.express.use(express.static(path.join(__dirname, 'src/public')))

nunurServer.start()