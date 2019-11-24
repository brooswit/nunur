const uuidv1 = require('uuid/v1');

const MONGO_USER_COLLECTION_NAME = 'users';
const MONGO_URL = process.env['MONGODB_URI'];

const MongoClient = require('mongodb').MongoClient;
const redis = require("redis")
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const EventEmitter = require('events');

const assert = require('assert');

const events = new EventEmitter();
const mongoClient = new MongoClient(MONGO_URL);
const redisClient = redis.createClient();

mongoClient.connect(function(err) {
    assert.equal(null, err);
    const mongoUserCollection = mongoClient.db(MONGO_USER_COLLECTION_NAME);
    const app = express();
    const httpServer = http.createServer(app);
    const io = socketIO(httpServer);

    io.on('connection', function(socket){
        console.log('a user connected');
        socket.on('login', (username, password, token) => {
            redis.get(`token:${token}`, (err, value) => {
                assert.equal(err, null);
                const tokenUser = value;
                mongoUserCollection.find({username}).toArray((err, docs) => {
                    assert.equal(err, null);
                    let user = docs[0];
                    if (!user && !token) {
                        user = {username, password};
                            mongoUserCollection.insertMany([user], (err, result) => {
                            assert.equal(err, null);
                        });
                    }

                    if ( user && ((user.password === password) || (tokenUser == username)) ) {
                        const handleEventChat = (source, message) => {
                            socket.send(`${username}:chat`, source, message);
                        };
                        const handleSocketChat = (target, message) => {
                            events.emit(`${target}:chat`, username, message); 
                        };
                        const handleLogout = () => {
                            events.off(`${username}:chat`, handleEventChat);
                            socket.off(`${username}:chat`, handleSocketChat);
                            socket.off(`${username}:logout`, handleLogout);
                            socket.off('disconnect', handleLogout);
                        };

                        events.on(`${username}:chat`, handleEventChat);
                        socket.on(`${username}:chat`, handleSocketChat);
                        socket.on(`${username}:logout`, handleLogout);
                        socket.on('disconnect', handleLogout);

                        token = token || uuidv1();
                        redis.set(`token:${token}`, username);

                        socket.send(`${username}:login`, token);
                    } else {
                        socket.send(`${username}:logout`);
                    }
                });
            });
        });
    });

    httpServer.listen(HTTP_PORT, function(){
        console.log(`Nunur listening on *:${HTTP_PORT}`);
    });
});
