const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const fileUpload = require('express-fileupload')
const mysql = require('mysql')
const { connect } = require('http2')

const app = express()

app.use(fileUpload())

app.use(express.static('public'))
app.use(express.static('upload'))

//template engine
const handlebars = exphbs.create({
extname: '.hbs',
defaultLayout: 'main',
layoutsDir: path.join(__dirname, 'views/layouts'
)})
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs')

//connect to db
const con = mysql.createPool({
    connectionLimit: 10,
    host:       "localhost",
    user:       "root",
    password:   "",
    database:   "userprofile"
})
con.getConnection((err, connection) => {
        if (err) throw err
    console.log("Connected!")
})

app.get('/', (req, res) => {
    con.getConnection((err, connection) => {
        if (err) throw err


    con.query('SELECT * FROM user WHERE id = "1"', (err, rows) => {

        //release connection when done
        connection.release()

        if (!err){
            res.render('index', { rows })
        }
        })
   })
})

app.post('/', (req, res) => {
    let sampleFile
    let uploadPath

    if (!req.files || Object.keys(req.files).length === 0){
        return res.status(400).send('No files where uploaded.')
    }
    // name of the input
    sampleFile = req.files.sampleFile
    uploadPath = __dirname + '/upload/' + sampleFile.name
    console.log(sampleFile)

    // use mv() to place file on the server
    sampleFile.mv(uploadPath, (err) => {
        if(err) return res.status(500).send(err)

        // res.send('File uploaded!')

        con.getConnection((err, connection) => {
            if (err) throw err
    
    
        con.query('UPDATE  user SET profile_image =? WHERE id = "1"', [sampleFile.name], (err, rows) => {
    
            //release connection when done
            connection.release()
    
            if (err){
                console.log(err);
            } else {
                res.redirect('/')
            }

            })
       }) 

    })
})

app.listen(5000, ()=> console.log('server running on port 5000'))