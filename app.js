/**
 * Created by tintoll on 2017-02-06.
 */
var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var express = require('express');

//생성자 함수를 선언
var counter = 0;
function Product(name, image, price, count) {
    this.index = counter++;
    this.name = name;
    this.image = image;
    this.price = price;
    this.count = count;
}
var products = [
    new Product('JavaScript', 'chorme.png', 28000, 30),
    new Product('jQuery', 'chorme.png', 28000, 30),
    new Product('Node.js', 'chorme.png', 32000, 30),
    new Product('SocketIo', 'chorme.png', 17000, 30),
    new Product('Connect', 'chorme.png', 18000, 30),
    new Product('Express', 'chorme.png', 3100, 30),
    new Product('EJS', 'chorme.png', 12000, 30),
];


//웹 서버 생성
var app = express();
var server = http.createServer(app);
//웹서버 설정
app.use(express.static(__dirname+'/public'));

//라우트 설정
app.get('/',function (req,res,next) {
    var htmlPage = fs.readFileSync('htmlPage.html','utf8');
    res.send(ejs.render(htmlPage,{
        products : products
    }));
});

//웹 서버 실행
server.listen(52273,function () {
    console.log('Server Running 52273');
});



var io = require('socket.io').listen(server);
io.sockets.on('connect',function (socket) {

    //함수 선언
    function onReturn(index) {
        products[index].count++; //물건 개수를 증가

        //타이머를 제거합니다.
        clearTimeout(cart[index].timeID);

        delete cart[index]; //카트에서 물건을 제거합니다.

        //count 이벤트를 발생
        io.sockets.emit('count',{
            index : index,
            count : products[index].count
        });
    };

    var cart = {}; //자바스크립트 클로저를 이용해 각 클라이언트에 데이터를 저장하는 것과 같은 효과를 냅니다.
    //cart 이벤트
    socket.on('cart', function (index) {
        //물건 개수를 감소
        products[index].count--;

        //카트에 물건을 넣고 타이머를 시작
        cart[index] = {};
        cart[index].index = index;
        cart[index].timerID = setTimeout(function () {
            onReturn(index);
        }, 10 * 60 * 1000);

        //count 이벤트를 발생
        io.sockets.emit('count',{
            index : index,
            count : products[index].count
        });
    });


    //buy 이벤트
    socket.on('buy', function (index) {
        //타이머를 제거합니다.
        clearTimeout(cart[index].timerID);

        //카트에서 물건을 제거합니다.
        delete cart[index];

        io.sockets.emit('count',{
            index : index,
            count : products[index].count
        });
    });

    //return 이벤트
    socket.on('return',function (index) {
       onReturn(index);
    });
});

