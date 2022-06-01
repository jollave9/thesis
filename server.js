// var Sentiment = require('sentiment');
var cors = require('cors');
// var sentiment = new Sentiment();
// const mysql = require('mysql');
const express = require('express')
const fs = require('fs')
const app = express()
const path = require('path');

app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({extended:true,limit:'50mb'}))
app.use(cors())
app.use(express.static(__dirname + '/data/'));
app.use(express.static(__dirname + '/views/'));

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

const multer = require('multer');
const { exec } = require('child_process');
const { render } = require('express/lib/response');
const { TIMEOUT } = require('dns');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './')
    },
    filename: function (req, file, cb) {
        const length = fs.readdirSync('./').length
        cb(null, `123.wav`)
    }
  })
  
const upload = multer({ storage: storage })

// app.get('/recordings',(req,res)=>{
//   let files = fs.readdirSync('./public')
//   res.json(files)
// })

// app.post('/seconds',(req,res)=>{
//   console.log(req.body.seconds)
//   exec(`python clienttcp.py ${req.body.seconds}`, (err, stdout, stderr) => {
//     if (err) {
//       // node couldn't execute the command
//       return;
//     }
  
//     // the *entire* stdout and stderr (buffered)
//     console.log(`stdout: ${stdout}`);
//     console.log(`stderr: ${stderr}`);
//   });

//   // for testing purposes only
//   setTimeout(() => {
//     res.send('asdf')
//   }, (req.body.seconds-0+3)*1000);
// })
// app.get('/decibel/:audio',(req,res)=>{
//   if(!fs.existsSync(`./data/${req.params.audio.replace('wav','json')}`)){
//     exec(`python extractdecibel.py ./public/${req.params.audio}`, (err, stdout, stderr) => {
//       if (err) {
//         // node couldn't execute the command
  
//         return;
//       }
    
//       // the *entire* stdout and stderr (buffered)
//       console.log(`stdout: ${stdout}`);
//       console.log(`stderr: ${stderr}`);
//     });
//     // for testing purposes only
//     setTimeout(() => {
//       res.redirect(`/${req.params.audio.replace('wav','json')}`)
//     }, 4000);
//   }
//   else{
//     console.log('here')
//     res.redirect(`/${req.params.audio.replace('wav','json')}`)
//   }
// })

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
    // console.log(formatted)

    index = temp.findIndex((element)=>{
        return element.label===formatted.label
    })

    index === -1? temp.push(formatted): temp[index].score+= formatted.score
    
  }

  // temp.sort((a,b)=>b.score - a.score)
  // temp = temp.slice(0,10)
  return temp.map(x=>{return{...x,score:x.score/len}})
}

// app.post('/categories',(req,res)=>{
  
//   cc = cleanCategories(req.body.data)
//   const length = fs.readdirSync('./categories').length
//   fs.writeFile(`./categories/category_${length}.json`, JSON.stringify(cc), (error) => {
//     if (error) throw error;
//   });

//   res.sendStatus(200)
// })

// app.get('/categories',(req,res)=>{
//   let files = fs.readdirSync('./categories')
//   res.json(files)
// })


//get top 10 categories to be implemented

const createjsonfile = (filename,categories_json,decibel_level_json) =>{
    //writing json file
    file = `./data/${date}/${hour}/${minute}/${filename}_categories.json`
    fs.writeFileSync(file, JSON.stringify(categories_json));
    //writing json file
    file = `./data/${date}/${hour}/${minute}/${filename}_decibelLevel.json`
    fs.writeFileSync(file, JSON.stringify(decibel_level_json)); 
}
// put timeout after creating dir before reading files inside

const createdirectories = (minutelydir,hourlydir,dailydir,fulldatetime) => {
  if (fs.existsSync(minutelydir)) {
    console.log('minutelydir')
    createjsonfile(fulldatetime,categories,decibelLevels)

  }
  else {
    if (fs.existsSync(hourlydir)) {
      console.log('hourlydir')
      fs.mkdirSync(minutelydir)
      createjsonfile(fulldatetime,categories,decibelLevels)
    }
    else{
      
      if (fs.existsSync(dailydir)) {
        console.log('dailydir')
        fs.mkdirSync(hourlydir)
        fs.mkdirSync(minutelydir)
        createjsonfile(fulldatetime,categories,decibelLevels)
      }
      else{
        fs.mkdirSync(dailydir)
        fs.mkdirSync(hourlydir)
        fs.mkdirSync(minutelydir)
        createjsonfile(fulldatetime,categories,decibelLevels)
      }
    }
  }

  !fs.existsSync(`${hourlydir}/summary`) && fs.mkdirSync(`${hourlydir}/summary`)
  !fs.existsSync(`${dailydir}/summary`) && fs.mkdirSync(`${dailydir}/summary`)
}
const createCategoriesSummary = (dir,currentSummary,previousSummary)=>{
  for(item of currentSummary){
    index = previousSummary.findIndex((element)=>{
      return element.label===item.label
    })

    index === -1? previousSummary.push(item): previousSummary[index].score+= item.score
  }
  // categories_summary.sort((a,b)=>b.score - a.score)
  // categories_summary = categories_summary.slice(0,10)
  console.log('new catergories here')
  console.log(previousSummary)
  fs.writeFileSync(`${dir}/summary/categories.json`, JSON.stringify(previousSummary)); 
}
const createDecibelLevelSummary = (dir,currentSummary,previousSummary)=>{
  previousSummary.soft += currentSummary.soft
  previousSummary.moderate += currentSummary.moderate
  previousSummary.loud += currentSummary.loud
  previousSummary.very_loud += currentSummary.very_loud
  console.log(previousSummary)
  fs.writeFileSync(`${dir}/summary/decibel_levels.json`, JSON.stringify(previousSummary)); 
}
const createDecibelTimelineSummary = (dir)=>{
  let files = fs.readdirSync(dir)
  decibel_timeline = []

  for(file of files){
    // hourly timeline and daily timeline has different file structure
    if(file==='summary')
    break

    jsons = fs.readdirSync(`${dir}/${file}`)
    // console.log(jsons)
    dl = {}
    if(jsons[0].length === 2){
      jsons = fs.readdirSync(`${dir}/${file}/summary`)
      dl = require(`${dir}/${file}/summary/${jsons[1]}`)
    }
    else {
      dl = require(`${dir}/${file}/${jsons[1]}`)
    }

    decibel_timeline.push({[file]:dl})
  }

  console.log(decibel_timeline)
  fs.writeFileSync(`${dir}/summary/decibel_timeline.json`, JSON.stringify(decibel_timeline)); 
}
const createHourlySummary = (hourlydir,categories,decibelLevels)=>{
  if(fs.existsSync(`${hourlydir}/summary/categories.json`)){
    let categories_summary = require(`${hourlydir}/summary/categories.json`)
    console.log('hourly summary')
    // console.log(categories_summary)
    
    len = categories.length
    percentage_based_categories = categories.map(x=>{return{...x,score:x.score/len}})
    // console.log(percentage_based_categories)

    createCategoriesSummary(hourlydir,percentage_based_categories,categories_summary)

  }
  else {
    fs.writeFileSync(`${hourlydir}/summary/categories.json`,JSON.stringify(categories),(error)=>{
      if(error) throw error
    })
  }

  if(fs.existsSync(`${hourlydir}/summary/decibel_levels.json`)){
    let decibel_levels_summary = require(`${hourlydir}/summary/decibel_levels.json`)
    console.log('decibel levels summary')
    // console.log(decibel_levels_summary)

    createDecibelLevelSummary(hourlydir,decibelLevels,decibel_levels_summary)

  }
  else{
    fs.writeFileSync(`${hourlydir}/summary/decibel_levels.json`,JSON.stringify(decibelLevels),(error)=>{
      if(error) throw error
    })
  }

  createDecibelTimelineSummary(hourlydir)

}

const createDailySummary = (dailydir,hourlydir)=>{
  categories_hourly_summary = require(`${hourlydir}/summary/categories.json`)
  decibel_levels_hourly_summary = require(`${hourlydir}/summary/decibel_levels.json`)

  if(fs.existsSync(`${dailydir}/summary/categories.json`)){
    categories_daily_summary = require(`${dailydir}/summary/categories.json`)
    createCategoriesSummary(dailydir,categories_hourly_summary,categories_daily_summary)
  }
  else{
    fs.writeFileSync(`${dailydir}/summary/categories.json`,JSON.stringify(categories_hourly_summary),(error)=>{
      if(error) throw error
    })
  }

  if(fs.existsSync(`${dailydir}/summary/decibel_levels.json`)){
    let decibel_levels_summary = require(`${dailydir}/summary/decibel_levels.json`)
    console.log('decibel levels daily summary')
    console.log(decibel_levels_summary)

    createDecibelLevelSummary(hourlydir,decibel_levels_hourly_summary,decibel_levels_summary)

  }
  else{
    fs.writeFileSync(`${dailydir}/summary/decibel_levels.json`,JSON.stringify(decibelLevels),(error)=>{
      if(error) throw error
    })
  }

  createDecibelTimelineSummary(dailydir)

}
app.post('/data', (req,res)=>{
  decibelLevels = JSON.parse(req.body.decibelLevels)
  categories = cleanCategories(req.body.categories)
  console.log(decibelLevels)
  console.log(categories)

  datetime = req.body.date.split(' ')
  date = datetime[0]
  time = datetime[1].split(':')

  hour = time[0]
  minute = time[1]
  console.log(`date:${date}, time:${time}, hour:${hour}, minute:${minute}`)

  minutelydir = `./data/${date}/${hour}/${minute}`
  hourlydir = `./data/${date}/${hour}`
  dailydir = dir = `./data/${date}`

  fulldatetime = datetime.join('_').replaceAll(':','-').replaceAll('.','')
  // console.log(minutelydir)
  // console.log(hourlydir)
  // console.log(dailydir)
  // console.log(fulldatetime)

  createdirectories(minutelydir,hourlydir,dailydir,fulldatetime)
  createHourlySummary(hourlydir,categories,decibelLevels)
  createDailySummary(dailydir,hourlydir)
  
  res.sendStatus(200)
  
})

app.listen(5000,()=>console.log('listening on port 5000'))