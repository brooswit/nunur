const Nunur = require('./src/nunur')
const nunur = new Nunur()

nunur.express.use(express.static(path.join(__dirname, 'build')))
nunur.express.use(express.static(path.join(__dirname, 'public')))

nunur.start()