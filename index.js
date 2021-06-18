const express = require("express");
const app = express();
app.use(express.json()); //isso para garantir o tratamento do json

// Permissões, senão colocar pode ser que NÂO
// funcione com o cliente
var cors = require('cors');
app.use(cors());

// Porta que eu estou ouvindo, o primeiro  pro heroku e o segundo é pra usar no PC
app.listen(process.env.PORT || 3000);


// strings para o banco de dados
const Racionais_MCs = '{ "name":"Racionais_MCs", "type":"RAP", "about":"Grupo paulista de origem periférica que se destacou desde seu inicio aos dias de hoje.." }';
const Sabotage = '{ "name":"Sabotage", "type":"RAP", "about":"Artista paulista periférico que trouxe mensagens que atigem a todos mesmo após sua morte." }';
const Metallica = '{ "name":"Metallica", "type":"Rock", "about":"Banda internacionalmente reconhecida pelo seu estilo Metal." }';
const Nirvana = '{ "name":"Nirvana", "type":"Rock", "about":"Banda internacionalmente conhecida pelos seus sons Grunge" }';
const Turma_do_pagode = '{ "name":"Turma_do_pagode", "type":"Pagode", "about":"Grupo que marcou o pagode nacional com suas musicas dançantes e animadas;" }';
const Exaltassamba= '{ "name":"Exaltassamba ", "type":"Pagode", "about":"Grupo que marcou com inúmeras músicas de amor e alegria." }';
const Ludmilla = '{ "name":"Ludmilla", "type":"Funk", "about":"Cantora que se destacou por sua diversificação no próprio estilo,também agregando outros." }';
const Bob_Marley = '{ "name":"Bob_Marley", "type":"Reggae", "about":"Artista mundialmente conhecido pelas suas musicas de paz e amor às pessoas." }';
const Michael_Jackson  = '{ "name":"Michael_Jackson", "type":"POP", "about":"Artista mundialmente conhecido por suas musicas POP que influenciaram gerações" }';


// array simulando um banco de dados, com os objeto Json
const spotfy = [ JSON.parse(Racionais_MCs), 
                  JSON.parse(Sabotage),
                  JSON.parse(Metallica),
                  JSON.parse(Nirvana),
                  JSON.parse(Turma_do_pagode),
                  JSON.parse(Exaltassamba),
                  JSON.parse(Ludmilla),
                  JSON.parse(Bob_Marley),
                  JSON.parse(Michael_Jackson)
];

// novo endpoint com uma explicação inicial
app.get('/',
    function(req, res){
        res.send("Olá esse é o Backend de Giovane Saito e Nyahn Ekyê.Fizemos como banco de dados,uma biblioteca de artistas/bandas"); 
    }
);

// novo endpoint com o banco de dados
app.get('/spotify',
    function(req, res){
        res.send(spotify.filter(Boolean)); //isso é pra tratar os valores q aparecem como
                                             //null, que são lidos como boleano
    }
);

// arrumando os indeces do arry para facilitar interface para o usuario
app.get('/spotify/:id',
    function(req, res){
        const id = req.params.id - 1;
        const spotifys = spotify[id];

        if (!spotifys){
            res.send("Artista não encontrado");
        } else {
            res.send(spotifys);
        }
    }
)
// usando o verbo post
app.post('/spotify', 
    (req, res) => {
        console.log(req.body.spotifys); // codigo para receber a mensagem 
        const spotifys = req.body.spotifys;
        spotify.push(spotifys); // vai colocar a nova mensgem no banco de dados, quando atualizar o localhost vai aparecer
                                 // a mensagem adicionada ao banco de dados, no caso um array
        res.send("Artista adicionado")
    }
);
// trocar algo antigo por algo novo
app.put('/spotify/:id',
    (req, res) => {
        const id = req.params.id - 1;
        const spotifys = req.body.spotifys;
        spotify[id] = spotifys;        
        res.send("Artista atualizado com sucesso.")
    }
)

app.delete('/spotify/:id', 
    (req, res) => {
        const id = req.params.id - 1;
        delete spotify[id];

        res.send("Artista removido com sucesso");
    }
);

/*
    Daqui pra baixo MongoDB
*/

const mongodb = require('mongodb')
const password = process.env.PASSWORD || "asdf";
console.log(password);

const connectionString = `mongodb+srv://admin:${password}@cluster0.05d5a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const options = { useNewUrlParser: true, 
                  useUnifiedTopology: true 
                };
(async()=>{
    const client = await mongodb.MongoClient.connect(connectionString,options);
    const db = client.db("myFirstDatabase");
    const spotify = db.collection('spotify');
    console.log(await spotify.find({}).toArray());

    app.get('/database',
    async function(req, res){
        res.send(await spotify.find({}).toArray());
    }
    );

    app.get('/database/:id',
    async function(req, res){
        const id = req.params.id;
        const Artista = await spotify.findOne(
            {_id : mongodb.ObjectID(id)}
        );
        console.log(Artista);
        if (!Artista){
            res.send("Artista não encontrado");
        } else {
            res.send(Artista);
        }
    }
);

app.post('/database', 
    async (req, res) => {
        console.log(req.body);
        const Artista = req.body;
        
        delete Artista["_id"];

        spotify.insertOne(Artista);        
        res.send("criar um Artista.");
    }
);

app.put('/database/:id',
    async (req, res) => {
        const id = req.params.id;
        const Artista = req.body;

        console.log(Artista);

        delete Artista["_id"];

        const num_spotify = await spotify.countDocuments({_id : mongodb.ObjectID(id)});

        if (num_spotify !== 1) {
            res.send('Ocorreu um erro por conta do número de mensagens');
            return;
        }

        await spotify.updateOne(
            {_id : mongodb.ObjectID(id)},
            {$set : Artista}
        );
        
        res.send("Artista atualizada com sucesso.")
    }
)

app.delete('/database/:id', 
    async (req, res) => {
        const id = req.params.id;
        
        await spotify.deleteOne({_id : mongodb.ObjectID(id)});

        res.send("Artista removido com sucesso");
    }
);

})();
