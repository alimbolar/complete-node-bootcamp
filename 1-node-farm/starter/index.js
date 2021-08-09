const fs = require('fs');
const http = require('http');
const url = require('url')



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
const dataObj = JSON.parse(data);

const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`,'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`,'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/card.html`,'utf-8');


const replaceTemplate = function(template, element){
    let output = template;            
    output = output.replace(/{%PRODUCT_NAME%}/g, element.productName);
    output = output.replace(/{%IMAGE%}/g, element.image);
    output = output.replace(/{%FROM%}/g, element.from);
    output = output.replace(/{%QUANTITY%}/g, element.quantity);
    output = output.replace(/{%PRICE%}/g, element.price);
    output = output.replace(/{%DESCRIPTION%}/g, element.description);
    output=output.replace(/{%ID%}/g,element.id)
    
    if(!element.organic){
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
    }else{
    output = output.replace(/{%NOT_ORGANIC%}/g, '');
    }

    return output
}

const server = http.createServer((request,response)=>{


    const {pathname,query } = url.parse(request.url,true);
    console.log(request.url,pathname,query)

    // const data = fs.readFileSync('./dev-data/data.json','utf-8')
    // const productData = JSON.parse(data);

    // const overviewHTML = fs.readFileSync(`${__dirname}/templates/overview.html`);
    // const productHTML = fs.readFileSync(`${__dirname}/templates/product.html`);


    ////// OVERVIEW
    if(pathname === '/' || pathname === '/overview'){
        response.writeHead(200,{"Content-type":"text/html"});
        // response.end(tempOverview);

        const cardsHTML = dataObj.map(product => replaceTemplate(tempCard,product)).join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}',cardsHTML)

        // console.log(cardsHTML)

        response.end(output);

        //// PRODUCT    
    } else if (pathname === '/product'){

        const product = dataObj[query.id];

        console.log(product);

        response.writeHead(200,{"Content-type":"text/html"});
        const output = replaceTemplate(tempProduct,product)

        response.end(output);


    ///// API
    } else if (pathname === '/api'){
        response.writeHead(200,{
            "Content-type":"application/json"
        })
        response.end(data);


    //// PAGE NOT FOUND
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