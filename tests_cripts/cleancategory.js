const jsonData= require('../categories/category_0.json'); 
let temp = []
String.prototype.replaceAt = function(index, replacement) {
  return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}
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

    index = temp.findIndex((element)=>{
        return element.label===formatted.label
    })

    index === -1? temp.push(formatted): temp[index].score+= formatted.score
    
  }
console.log(temp)