const fs = require('fs');
// const { read } = require('fs/promises');
const server = require('http').createServer();
// Solution #1

server.on('request',(req,res)=>{

    // // Solution #1
    // fs.readFile('./test-file.txt','utf-8',(err,data)=>{
    //     res.end(data);
    // })

    // // Solution #2
    // const readable = fs.createReadStream('test-file.txt');
    // readable.on('data',chunk=>{
    //     res.write(chunk);
    // })
    // readable.on('end',()=>{
    //     res.end()
    // })

    // Solution #3
    const readable = fs.createReadStream('test---file.txt');
    readable.pipe(res,{end:false});

    readable.on('end',()=>
    {
    console.log('streaming ended');
    res.end('streaming ended');
    });
    // res.end();

    readable.on('error',(err)=>{
        res.statusCode = 500;
        console.log(err);
        res.end("File not found");
    })


})

server.listen(8000,()=>console.log('listening to server'));