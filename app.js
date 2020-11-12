const express = require('express')
const winston = require('winston')

const app = express();

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