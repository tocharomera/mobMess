1,0,0,0,1,0,1,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var os = require('os')
var Queue = require('buffered-queue');
var fs = require('fs')
var qr = require('qr-image');


function file(name) {
    return fs.createWriteStream(__dirname + '/' + name);
}
//
var font = {
     '0': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
    '1': [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1],
    '2': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    '3': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
    '4': [1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    '5': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
    '6': [1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
    '7': [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
    '8': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
    '9': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1],   
    ' ': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    '.': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    ',': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    'a': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    'b': [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
    'c': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    'd': [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
    'e': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    'f': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    'g': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    'h': [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    'i': [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
    'j': [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
    'k': [0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0],
    'l': [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    'm': [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    'n': [0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0],
    'o': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    'p': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    'r': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0],
    's': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    't': [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
    'x': [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
    'u': [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    'v': [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1],
    'w': [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    'y': [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
    'z': [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    '!': [1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    '?': [1,0,0,0,1,0,1,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1],
    '#': [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0]

}

var pixels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var address

var port = 3000
//socket to panel and to mobile devices
var panelsock = io.of('/panel')
var mobilesock = io.of('/mobile')

//template engine using mustache
var cons = require('consolidate')

// assign the mustache engine to .html files
app.engine('html', cons.mustache);
// set .html as the default extension
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
//allow access to public folder
app.use(express.static('public'))


//endpoint for new message
app.get('/msg/:msg', function(req, res) {
    msgQueue(req.params.msg+' ');
    res.send('ok');
})

app.get('/panel', function(req, res) {
    //list interfaces
    var ifaces = os.networkInterfaces();
    address = 'no address'
    for (var ifname in ifaces) {
        iface = ifaces[ifname]
        for (var i = 0; i < iface.length; i++) {
            var ifaddr = iface[i]['address']
            direcIp = iface[i]['address'];
            //filter ipv6 and localhost addresses
            if (ifaddr.indexOf('.') != -1 && ifaddr.substr(0, 3) != '127') {
                address = ifaddr


            }
        }
    }
    //qr.image("http://"+address+":"+port+"/", { type: 'svg', parse_url: true }).pipe(file('/public/qrAddr.svg'));

    res.render('panel', {
        address: address + ":" + port 
    })
})

app.get('/', function(req, res) {
    //if no mobile is specified connect to a empty pixel
    for (var pixelid = 0; pixelid < 50; pixelid++) {
        var room = mobilesock.adapter.rooms[pixelid]
        if (!room) {
            res.redirect('/mobile/' + pixelid)
        }
    }
})

app.get('/mobile/:id', function(req, res) {
    //if id is > 15 redirect
    //http://stackoverflow.com/a/11355430/2205297
    if (!req.params.id) {
        for (var pixelid = 0; pixelid < 50; pixelid++) {
            var room = mobilesock.adapter.rooms[pixelid]
            if (!room) {
                res.redirect('/mobile/' + pixelid)
            }
        }
    }
    //render template
    res.render('mobile', {
        id: req.params.id
    })
})

/* panel connection */
panelsock.on('connection', function(socket) {

var kickId = []
    for (var pixelid = 0; pixelid < 50; pixelid++) {
        kickId.push(null)
        var room = mobilesock.adapter.rooms[pixelid]
        if (room) {
            
            kickId[pixelid] = room.length
        } else {
            kickId[pixelid] = 0
        }
	if(kickId.length>1){
	socket.disconnect(kickId[0])
}
    }
	

    console.log('a user connected to panel: ' + socket.id)
    //send pixel data
    socket.emit('pixels', pixels)
    //send connection data
    connCount()
    socket.on('disconnect', function() {
        console.log('user disconnected from panel: ' + socket.id)
    })
    
	
    //updates all bg of all the mobile devices
    socket.on('pixels', function(_pixels) {
        pixels = _pixels
        console.log(pixels)
        //update rest of panels
        socket.broadcast.emit('pixels', pixels)
        //update devices
       devicesUpdate()
    })
        

})
var phones;
var confirm = 0;
/* mobile connection */
mobilesock.on('connection', function(socket) {

    var pixelid = null

    //informs which pixelid is assoc to the device
    socket.on('pixel', function(_pixelid) {
        pixelid = _pixelid
        console.log('a mobile connected: ' + socket.id + " pixel:" + pixelid)
        socket.join(pixelid)
        //count connections
        connCount()
        //send the color of the pixel
        var color = pixels[pixelid] ? 'black' : 'white'
        socket.emit('c0', {
            hello: 'world'
        })
    })
    /*socket.on('ok', function(ok) {
      confirm++


      if(confirm>=phones){
        flag = ok
        console.log(confirm+"ok");
        confirm = 0
        }
    })*/
    //send to all panel connections
    socket.on('disconnect', function() {
        console.log('mobile disconnect: ' + socket.id)
        connCount()

    })

})

//counts connections for every pixel/room and sends it to panels
function connCount() {
    var connCount = []
    for (var pixelid = 0; pixelid < 50; pixelid++) {
        connCount.push(null)
        var room = mobilesock.adapter.rooms[pixelid]
        if (room) {
            phones = pixelid
            connCount[pixelid] = room.length
        } else {
            connCount[pixelid] = 0
        }
    }
    panelsock.emit('connCount', connCount)

}

//convert str formed by 0 and 1 to bit aray
function str2arr(str) {
    var bits = []
    for (var i = 0; i < str.length; i++) {
        var bit = (str[i] == '0') ? 0 : 1
        bits.push(bit)
    }
    return bits
}
//displays letter in devices, is possible update pixels value
function devicesUpdate(_pixels) {

    if (_pixels) {
        pixels = _pixels
    }

    for (var pixelid = 0; pixelid < 50; pixelid++) {
        var room = mobilesock.adapter.rooms[pixelid]
        if (room) {
            var color = pixels[pixelid] ? 'black' : 'white'

            mobilesock.to(pixelid).emit('bg', color)
        }
    }
}

//global var hold timeoutHandler so it displayMessage can be cleared and stopped
//if a new message arrives
var displayHandler = null
var lastMessage;
function msgloop(){
if (displayHandler === null){
console.log("loop");
	msgQueue(lastMessage);
 }
}

function msgQueue(msg) {
	 lastMessage = msg;
    msg.length = msg.length || 1000 ;
    var q = new Queue('msgBuffer', {
        size: 1,
        flushTimeout: 500,
        verbose: false,
        customResultFunction: function(items) {
            var temp = [];
            items.forEach(function(item, index, array) {

                temp.push(item.toLowerCase());
            });
            return temp.join('\n');
        }
    });
    if (displayHandler === null) {
        console.log("NEW FLUSH")
        q.on("flush", function(data, name) {
            console.log(data);
            alter(data);

        });
    }
    q.add(msg);
}
var flag = false;

function alter(data) {


    console.log("alter:" + data);

    console.log(phones);
    if (phones > 20) {
        displayMessage1(data)


        function displayMessage1(data) {
            var counter = 0;
            var mob = [];
            var msgIndex = -1;
            var letter;
            var letra;
            var limit = 50;
            var space;
           for (pixelid = limit; pixelid > -1; pixelid--) {
                //flag = false
                var room = mobilesock.adapter.rooms[pixelid]
                if (room) { //   ids moviles conectados
                    mob.push(pixelid);
                    //console.log(mob[mob.length-1]);
                    // mob.push(mob[mob.length-1])
                }

            }
            (function myLoop(i) {
                setTimeout(function() {
                    msgIndex++;
                    displayHandler = msgIndex;
                    displayHandler--;
                    if (msgIndex === (data.length)) {
                        panelsock.emit('finnished', true)
                        console.log("DONE")
                        displayHandler = null;
		        msgloop();

                    }
                    letter = data[msgIndex]
                    if (letter in font) {
                        letra = font[data[msgIndex]]
                       //while (flag == false) {
                            for (var h = -1; h < mob.length; h++) { //mob[h] = id
                                a = mob[h]
                                if (letra[a] === 0) {
                                    var blanco = "white"
                                    mobilesock.to(mob[h]).emit('bg', blanco)
                                    flag = true
                                } else if (letra[a] === 1) {
                                    var negro = "black"
                                    mobilesock.to(mob[h]).emit('bg', negro)
                                    flag = true
                                }
                            }
                        //}
                    }
                    panelsock.emit('pixels', font[data[msgIndex]]);
                    if (msgIndex === data.length) {
                        panelsock.emit('pixels', font[' ']);
                    }
                    if (--i) myLoop(i); //  decrement i and call myLoop again if i > 0
                }, 550)
            })(data.length + mob.length);
            console.log("TOTAL" + (data.length + (mob.length)))
        }
    } else {
        displayMessage2(data)
        function displayMessage2(data) {
            var counter = 0;
            var mob = [];
            var msgIndex = -1;
            var letter;
            var letra;
            var limit = 50;
            var space;
            for (pixelid = limit; pixelid > -1; pixelid--) {
                var room = mobilesock.adapter.rooms[pixelid]
                if (room) { //   ids moviles conectados
                    mob.push(pixelid);
                }
            }
            (function myLoop(i) {
                setTimeout(function() {

                    displayHandler = msgIndex;
                    displayHandler--;
                    msgIndex++;
                    if (msgIndex === (data.length + mob.length)-1) {
                        panelsock.emit('finnished', true)
                        console.log("DONE")
                        displayHandler = null;
			loop();
                      //  flag = true;
                    }
                  //  while (flag == false) {
                        for (var h = -1; h < mob.length; h++) {
                            letter = data[msgIndex - h];
                            if (letter in font) {
                                space = 1
                                letra = font[data[msgIndex - h]]
                                mobilesock.to(mob[h]).emit('pixels', letra)
                            } else {
                                space = 0
                                letter = ' '
                                letra = font[letter]
                                mobilesock.to(mob[h]).emit('pixels', letra)
                            }
                            panelsock.emit('pixels', font[data[msgIndex]]);

                            if (msgIndex === data.length) {
                                mobilesock.to(mob).emit('bg',font[' ']); 
				panelsock.emit('pixels', font[' ']);
                            }
                            //flag = true
                        }
                    //}
                    console.log(letter);
                    if (--i) myLoop(i); //  decrement i and call myLoop again if i > 0
                }, 550)
            })(data.length + mob.length);
            console.log("TOTAL" + (data.length + (mob.length)))
        }
    }
}
http.listen(port, function() {
    console.log('listening on ' + port)
})
	
