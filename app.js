var express = require('express');
var app = express();
var VirtualMassiv = [{ "name": "CAt", "password": "123" }, { "name": "cat", "password": "321" }, { "name": "aaa", "password": "12345" }]
var serv = require('http').Server(app);
var body = require("body-parser");
const parser = body.urlencoded({ extended: false });

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/Registrate.html');
});
app.use('/client', express.static(__dirname + '/client'));
app.post('/', parser, function(req, res) {
    var flag = true;

    for (let i = 0; i < VirtualMassiv.length; i++) {
        if ((VirtualMassiv[i].name == req.body.Name) && (VirtualMassiv[i].password == req.body.Pas)) {
            flag = false;
            res.sendFile(__dirname + '/client/index.html');
        }
    }
    if (flag) {
        res.send("This user dont exist");

    }


})

serv.listen(2000);
console.log("Server started.");
//
//В этой части кода мы экпортируем необходимые библиотеки и поднимаем сервер на 2000-ом порту 
//
//

var SOCKET_LIST = {};

var Entity = function() {
        var self = {
            x: 250,
            y: 250,
            spdX: 0,
            spdY: 0,
            id: "",
            //
            //переменная self хранит все значение объекта 
            //(x,y - положение объекта ; spdX,SpdY - то, на сколько должна поменяться позиция игрока за этот кадр; id - собственно, id игрока)
            //

        }
        self.update = function() {
            self.updatePosition();
        }
        self.updatePosition = function() {
                self.x += self.spdX;
                self.y += self.spdY;
            }
            //
            //Функци, которая обновляет позиции по spdX и spdY о которых рассказано выше
            //
        return self;
    }
    //
    //
    //
var Player = function(id) { // socket.id появится в запуске сокетов

    var self = Entity();
    //используем заготовку для объектов Entity(), чтоб создать нашего игрока
    //
    self.id = id;
    //добавяем ироку его собсвенный id
    //
    self.number = "" + Math.floor(10 * Math.random());
    //ставим игроку его собсвенный номер, с которым мы будем видеть его на экране
    //
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    //Тут мы создаём переменные, которые будут принимать значения клавиш
    //
    self.maxSpd = 10;
    //Неожиданно, но это максимальная скорость объекта
    //
    var super_update = self.update;
    //тут мы просто кидаем ссылку на нашу старую функцию  self.update чтобы проще обращаться к ней
    //
    self.update = function() {
        self.updateSpd();
        super_update();
        //тут мы переопределяем функцию self.update  и добовляем в неё функцию self.updateSpd(о ней напишу потом)
        //Ну и добовляем super_update чтоб обновить позицию игрока 
        //
        //
    }


    self.updateSpd = function() {
            if (self.pressingRight)
                self.spdX = self.maxSpd;
            else if (self.pressingLeft)
                self.spdX = -self.maxSpd;
            else
                self.spdX = 0;

            if (self.pressingUp)
                self.spdY = -self.maxSpd;
            else if (self.pressingDown)
                self.spdY = self.maxSpd;
            else
                self.spdY = 0;



        }
        //Тут мы изменяем значения self.spdX и self.spdY, используя данные с нажатий клавиш
        //
        //
    Player.list[id] = self;
    return self;
    //мы добовляем нашего новоиспечённого игрока в список остальных игорков(чтоб потом проще к нему обращаться при рассылке пакетов)
    //и выводим его как результат работы функции
    //
}

Player.list = {};
Player.onConnect = function(socket) { //собственно сокет по которому будем прокидывать данные 
        //Метод, который запустем  при подкючении сокета
        var player = Player(socket.id);
        //используе метод Player и создаём с помощью него ноаго игрока и ложем ссылку на него в переменную player
        //
        socket.on('keyPress', function(data) {
            if (data.inputId === 'left')
                player.pressingLeft = data.state;
            else if (data.inputId === 'right')
                player.pressingRight = data.state;
            else if (data.inputId === 'up')
                player.pressingUp = data.state;
            else if (data.inputId === 'down')
                player.pressingDown = data.state;
            //
            //Начинаем крутить событие, которое срабатывает по нажатию клавиш и посылает к нам на сервер данные с этими самыми клавишами
            //просто редактируем player(будем считать что это self).pressing под полученные данные 
        });

    }
    //
    //
    //
    //
    //
    //
Player.onDisconnect = function(socket) {
        delete Player.list[socket.id];
    }
    //
    //метод удаления игрока из списка всех игроков
    //
    //

Player.update = function() { // метод Player.update который вернёт нам массив со всеми объектами и игроками в игре 
        var pack = [];
        ///Сам возращаемый массив
        for (var i in Player.list) { //Проходи по списку игроков 
            var player = Player.list[i];
            // просто кидаем ссылку на игрока в переменную 
            player.update();
            // обновляем позиции игрока 
            pack.push({
                x: player.x,
                y: player.y,
                number: player.number
            }); //добовляем в массив игроков позицию и номер игрока
        } // и так со всеми игроками
        return pack;
        // возращаем этот массив 
    }
    //
    //
    //Здесть мы создаём метод, который обновляет позиции всех игроков и складывает их место и номер в массив pack, а потом вывоит его
    //
    //
    //



var Bullet = function(angle) {
    var self = Entity();
    // создание пули по заготовки Entity()
    self.id = Math.random();
    // ставим ему рандомный id
    self.spdX = Math.cos(angle / 180 * Math.PI) * 10;
    self.spdY = Math.sin(angle / 180 * Math.PI) * 10;
    //тут сказали не париться => выполняем 

    self.timer = 0;
    //
    //перменная проверяет сколько раз мы обноаляли позицию пули
    //
    self.toRemove = false;
    //Флаг на удаление объекта 
    //
    //
    var super_update = self.update;
    //Это я где-то уже видел
    self.update = function() { //
        if (self.timer++ > 100)
            self.toRemove = true;
        super_update();
        //
        //таймер, который проверяет когда надо удалит объект  и super_update
        //
        //
    }
    Bullet.list[self.id] = self;
    //добавляем пулю в список
    //
    return self;
}
Bullet.list = {};

Bullet.update = function() {
        if (Math.random() < 0.1) {
            Bullet(Math.random() * 360);
            //если в рандоме вылетит значение < 0.1, то создаём новую пулю с случайным id
            //
        }

        var pack = [];
        for (var i in Bullet.list) {
            var bullet = Bullet.list[i];
            bullet.update();
            pack.push({
                x: bullet.x,
                y: bullet.y,
            });
        }
        // Пропускаем все пули, обновляем им значения и заодно закладываем значение в массив pack
        //
        //
        return pack;


        //выкидываем  массив из метода

    }
    //

var DEBUG = true;
// проверка на ошибки
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
    socket.emit("UpdateName", {})
        //Поднимаем сокет
    socket.id = Math.random();

    //ставим нашему сокету случайный id
    SOCKET_LIST[socket.id] = socket;
    // кидаем наш сокет в список 
    socket.on("NewName", function(date) {
        socket.name = date.name;


    })

    Player.onConnect(socket);
    // onConnect уже был 

    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
        //
        //при отсоединение сокета удаляем его из SOCKET_LIST и используем метод Player.onDisconnect()
        //
    });
    socket.on('sendMsgToServer', function(data) {
        var playerName = ("" + socket.name);
        // Тут я подредактировал 

        for (var i in SOCKET_LIST) {
            SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
        }
        //
        //
        //Тут работа с чатом и прокидованием сообщений к кажому сокету
        //
    });

    socket.on('evalServer', function(data) {
        if (!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer', res);
    });

    //
    //Тут мы запускаем сокеты 
    //
    //


});

setInterval(function() {
    var pack = {
        player: Player.update(),
        bullet: Bullet.update(),
    }

    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack);
    }
}, 1000 / 25);
//
//начинаем прокидку данных с клиентом с заданным интервалом 
//