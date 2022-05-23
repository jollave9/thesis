// var Sentiment = require('sentiment');
var cors = require('cors');
// var sentiment = new Sentiment();
// const mysql = require('mysql');
const express = require('express')
const fs = require('fs')
const app = express()
const path = require('path');

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/data/'));
app.use(express.static(__dirname + '/categories/'));
app.use(express.static(__dirname + '/views/'));

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

const multer = require('multer');
const { exec } = require('child_process');
const { render } = require('express/lib/response');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public')
    },
    filename: function (req, file, cb) {
        const length = fs.readdirSync('./public').length
        cb(null, `recording_${length}.wav`)
    }
  })
  
const upload = multer({ storage: storage })

app.get('/recordings',(req,res)=>{
  let files = fs.readdirSync('./public')
  res.json(files)
})

app.post('/seconds',(req,res)=>{
  console.log(req.body.seconds)
  exec(`python clienttcp.py ${req.body.seconds}`, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
  
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });

  // for testing purposes only
  setTimeout(() => {
    res.send('asdf')
  }, (req.body.seconds-0+3)*1000);
})
app.get('/decibel/:audio',(req,res)=>{
  if(!fs.existsSync(`./data/${req.params.audio.replace('wav','json')}`)){
    exec(`python extractdecibel.py ./public/${req.params.audio}`, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
  
        return;
      }
    
      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
    // for testing purposes only
    setTimeout(() => {
      res.redirect(`/${req.params.audio.replace('wav','json')}`)
    }, 4000);
  }
  else{
    console.log('here')
    res.redirect(`/${req.params.audio.replace('wav','json')}`)
  }
})

app.post('/',upload.single('audio'),(req,res)=>{
    // console.log(req)
    
    res.sendStatus(200)
})

const cleanCategories = (jsonData)=>{
  String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
  }
  let temp = []
  len = jsonData.length
  for(data of jsonData){
    formatted = data
                .replace('Category','')
                .replaceAll('=',':')
                .replace('label','"label"')
                .replace('score','"score"')
                .replaceAll('\'','"')

    formatted = formatted.replaceAt(0,'{')
    formatted = formatted.replaceAt(formatted.length-1,'}')

    // console.log(formatted)
    formatted=JSON.parse(formatted)
    console.log(formatted)

    index = temp.findIndex((element)=>{
        return element.label===formatted.label
    })

    index === -1? temp.push(formatted): temp[index].score+= formatted.score
    
  }

  // return temp
  return temp.map(x=>{return{...x,score:x.score/len}})
}
app.post('/categories',(req,res)=>{
  // console.log(req.body)
  
  cc = cleanCategories(req.body.data)
  const length = fs.readdirSync('./categories').length
  fs.writeFile(`./categories/category_${length}.json`, JSON.stringify(cc), (error) => {
    if (error) throw error;
  });
  // for(s in req.body.data){
  //   console.log
  // }
  res.sendStatus(200)
})

app.get('/categories',(req,res)=>{
  let files = fs.readdirSync('./categories')
  res.json(files)
})
app.get('/decibel_level',(req,res)=>{
  return res.render('results')
})
app.listen(5000,()=>console.log('listening on port 5000'))