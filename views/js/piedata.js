google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawPieChart);
google.charts.setOnLoadCallback(drawBarChart);
// import data from './recording_0.json';
// fetch('./recording_0.json')
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.log(error));
// const data = new Object;
var moderate = 0;
var loud = 0;
var veryLoud = 0;
let params = (new URL(document.location)).searchParams;
let filename = params.get('filename');
console.log(filename)
fetch('http://127.0.0.1:5000/'+filename)
.then(res => res.json())
.then(data => {
    //console.log(data);
    for (x in data){
        if(data[x]>-4){
            veryLoud++;
        }
        else if(data[x]>-20 && data[x]<-3){
            loud++;
        }
        else{
            moderate++;
        }
    }
    });


// for (x in data){
//     if(data[x]>-4){
//         veryLoud++;
//     }
//     else if(data[x]>-20 && data[x]<-3){
//         loud++;
//     }
//     else{
//         moderate++;
//     }
// }


function drawPieChart() {

var data = google.visualization.arrayToDataTable([
    ['Noise', 'Percentage'],
    ['Moderate', moderate],
    ['Very Loud', veryLoud],
    ['Loud', loud],
]);

var options = {
    title: 'Number of noises per level'
};

var chart = new google.visualization.PieChart(document.getElementById('piechart'));

chart.draw(data, options);
}

function drawBarChart() {
    var data = google.visualization.arrayToDataTable([
      ["Noise", "Amount", { role: "style" } ],
      ["Very Loud", veryLoud, "red"],
      ["Loud", loud, "orange"],
      ["Moderate", moderate, "blue"],
    //   ["Platinum", 21.45, "color: #e5e4e2"]
    ]);

    var view = new google.visualization.DataView(data);
    view.setColumns([0, 1,
                     { calc: "stringify",
                       sourceColumn: 1,
                       type: "string",
                       role: "annotation" },
                     2]);

    var options = {
      title: "Very Loud, Loud, Moderate",
      width: 600,
      height: 400,
      bar: {groupWidth: "95%"},
      legend: { position: "none" },
    };
    var chart = new google.visualization.BarChart(document.getElementById("barchart"));
    chart.draw(data, options);
}