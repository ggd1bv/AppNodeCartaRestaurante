let express = require('express');
const nunjucks = require('nunjucks');
// Importamos y configuramos dotenv
require('dotenv').config();

let app = express();

nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = process.env.RUTAMONGO;
const fechaActual = new Date();



// INDEX - HOME

app.get('/', (req, res) => {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(MONGO_URL);
  const dbName = process.env.DBNAME;

  async function findplatos() {
    await client.connect();
    const db = client.db(dbName);
    const comidas = db.collection(process.env.COLECCIONPLAT).find().sort({ "id": 1 }).toArray()
    return comidas
  }

  async function findcategorias() {
    await client.connect();
    const db = client.db(dbName);
    const categorias = db.collection(process.env.COLECCIONCATS).find().toArray()
    return categorias
  }

  const datos = {}

  findplatos()
    .then((platos) => {
      //console.log(platos)
      datos.platos = platos
    }
    ).then(
      () => {
        findcategorias().then(
          (categorias) => {
            datos.categorias = categorias
            res.render('index.html', { data: datos })
          }
        )
          .catch(console.error)
          .finally(() => client.close());
      }
    )
    .catch(console.error)

// RUTAS INDIVIDUALES

app.get('/comidas/:id', (req, res)=>{
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(MONGO_URL);
  const dbName = process.env.DBNAME;
  const id = parseInt(req.params.id)
  async function main() {
    await client.connect();
    const db = client.db(dbName);
    // MAL, HACERLO CON FIND ONE.
    //const comidas = db.collection(process.env.COLECCIONPLAT).find({"id":id}).toArray()
    const comidas = db.collection(process.env.COLECCIONPLAT).findOne({"id":id})
    return comidas
  }

  main()
    .then((data) => {
      //console.log(data4)
      res.render('comidas.html', { comi: data });
    }
    )
    .catch(console.error)
    .finally(() => client.close());

});



// ALTA PLATOS

app.get('/altaComidas', (req, res) => {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(MONGO_URL);
  const dbName = process.env.DBNAME;
  async function main() {
    await client.connect();
    const db = client.db(dbName);
    // acá es categorías para poder llenar el OPTION del form de Alta comida.
    const categorias = db.collection(process.env.COLECCIONCATS).find().toArray()
    return categorias
  }

  main()
    .then((data) => {
      //console.log(data)
      res.render('altaComidas.html', { cate: data });
    }
    )
    .catch(console.error)
    .finally(() => client.close());

});

// ALTA PLATOS - FORM

app.all('/altaComida', (req, res) => {
  // Verificamos si están viniendo por POST datos del formulario. En ese caso hacemos el insertOne en la base de datos
  if (req.body.id && req.body.plato && req.body.descripcion && req.body.categoria && req.body.precio && req.body.url) {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(MONGO_URL);
    const dbName = process.env.DBNAME;
    async function agregar() {
      await client.connect();
      const db = client.db(dbName);
      //const d = new Date();
      //const n = d.getTime()
      const collection = db.collection(process.env.COLECCIONPLAT);
      const insertar = await collection.insertOne(
        {
          id: parseInt(req.body.id),
          plato: req.body.plato,
          descripcion: req.body.descripcion,
          categoria: req.body.categoria,
          precio: parseInt(req.body.precio),
          url: req.body.url
        }
      )
      return insertar.insertedId //debe retornar algo.
    }

    agregar()
      .then(res.render('altaComidasExistosa.html', {fechaActual}))
      .catch(console.error)
      .finally(() => client.close());
  }
  else {
    // Ingresamos al formualario sin insertar datos
    res.render('altaComidas.html');
  }
})


// ALTA CATEGORIAS

app.all('/altaCategorias', function (req, res) {
  res.render('altaCategorias.html');
});



// ALTA CATEGORIAS - FORM

app.all('/altaCategoria', (req, res) => {
  // Verificamos si están viniendo por POST datos del formulario. En ese caso hacemos el insertOne en la base de datos
  if (req.body.id && req.body.categoria) {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(MONGO_URL);
    const dbName = process.env.DBNAME;
    async function agregar() {
      await client.connect();
      const db = client.db(dbName);
      //const d = new Date();
      //const n = d.getTime()
      const collection = db.collection(process.env.COLECCIONCATS);
      const insertar = await collection.insertOne(
        {
          id: parseInt(req.body.id),
          categoria: req.body.categoria
        }
      )
      return insertar.insertedId // debe retornar algo. en este caso no lo usamos
    }

    agregar()
      .then(res.render('altaCategoriasExistosa.html', {fechaActual}))
      .catch(console.error)
      .finally(() => client.close());
  }
  else {
    // Ingresamos al formualario sin insertar datos
    res.render('altaCategorias.html');
  }
})



// CATEGORÍA ENTRADAS

app.get('/categoria/:categoria', (req, res)=>{
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(MONGO_URL);
  const dbName = process.env.DBNAME;
  const cate = req.params.categoria
  async function main() {
    await client.connect();
    const db = client.db(dbName);
    const comidas = db.collection(process.env.COLECCIONPLAT).find({"categoria":cate}).toArray()
    return comidas
  }

  main()
    .then((data4) => {
      console.log(data4)
      res.render('categoriaIndividuales.html', { comi: data4 });
    }
    )
    .catch(console.error)
    .finally(() => client.close());

});







app.listen(8080);
