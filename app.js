const express = require('express')
const winston = require('winston')
const morgan = require('morgan')

const app = express();
app.use(morgan('tiny'))

require('./startup/db')();
require('./startup/routes')(app);
app.get('',(req,res) => {
    res.send({
        title:'Swift App',
        name:'Fafowora Oluwatobiloba'
    })
})


app.listen(3000, () => {
    winston.info("----Project is up and running----")
})