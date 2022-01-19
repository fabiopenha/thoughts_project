const { Sequelize } = require('sequelize')

const sequelize = new Sequelize ('thoughts1', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
})

try {
    sequelize.authenticate()
}catch(err){
    console.log(`Não foi possível conectar: ${err}`)
}

module.exports = sequelize