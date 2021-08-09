const EventEmitter = require('events');
// const http = require('http');


class Sales extends EventEmitter{
    constructor(){
        super();
        
    }
}
const MyEmitter = new Sales();

MyEmitter.on('newSale',()=>console.log('A new sale was recorded'));

MyEmitter.on('newSale',()=>console.log('Customer Name : Alim'));

MyEmitter.on('newSale',(stock,inventory,product)=>console.log(`The new stock is ${stock} from our ${inventory} of ${product}` ));

MyEmitter.emit('newSale',9,2000,"Sunglasses");  

//////////// SERVER

const server = require('http').createServer();

server.on('request', (req,res)=>{
    console.log('A new request has been received');
    res.end('Request has been received'); 
});

server.on('request', (req,res)=>{
    console.log('Another request 😬😬 has been received');
    res.end('Another Request 😬😬');
});

server.listen(8000,()=>console.log('listening to server'))