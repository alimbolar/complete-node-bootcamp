const fs = require('fs');
const http = require('http');



///////////////////////////////////////////////////////////
/////  FILES


// Blocking

// const data = fs.readFileSync('./txt/start.txt','utf-8');

// console.log(data);

// const data1 = fs.readFileSync(`./txt/${data}.txt`,'utf-8');

// console.log(data1);

// const input = fs.readFileSync('./txt/input.txt','utf-8');

// const newText = `What we know about avocado : ${input} \n Created On : ${Date.now()}`;

// const data2 = fs.writeFileSync('./txt/output.txt',newText);
// console.log(newText);

// Non Blocking

// fs.readFile('./txt/start.txt','utf-8', (err,data1)=>{
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err,data2)=>{
//         fs.readFile('./txt/append.txt','utf-8',(err,data3)=>{
//             fs.writeFile('./txt/final.txt',`${data2}\n${data3}`,'utf-8',(err,data4)=>{
//                 console.log('your file has been writen');
//             })

//         })
//     })
// })
// console.log('reading..');


///////////////////////////////////////////////////////////
/////  SERVER

const data = fs.readFileSync('./dev-data/data.json','utf-8')
const productData = JSON.parse(data);

const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`);
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`);

const server = http.createServer((request,response)=>{

    console.log(request.url);

    // const data = fs.readFileSync('./dev-data/data.json','utf-8')
    // const productData = JSON.parse(data);

    // const overviewHTML = fs.readFileSync(`${__dirname}/templates/overview.html`);
    // const productHTML = fs.readFileSync(`${__dirname}/templates/product.html`);


    if(request.url === '/' || request.url === '/overview'){
        response.writeHead(200,{"Content-type":"text/html"});
        response.end(tempOverview);

        response.end('this is OVERVIEW');
    } else if (request.url === '/product'){
        response.writeHead(200,{"Content-type":"text/html"});
        response.end(tempProduct);
    } else if (request.url === '/api'){
        response.writeHead(200,{
            "Content-type":"application/json"
        })
        response.end(data);

    }  else{
        response.writeHead(404,{
            "Content-type":"text/html",
            "Alim-Header" : "Tu es ma coucou.. Tu es ma cookie"
        })
        response.end('<h1>Page Not Found</h1>')
    }

    // response.end('Hello from Hell')

})

server.listen(8000,'localhost',()=>{
    console.log('listening to server on port 8000')
})