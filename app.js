
require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//const qrcode = require("qrcode");
const QR = require("qrcode");
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const app = express();
const expressSession = require('express-session');



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); 
app.use(express.json());
app.set("view engine", "ejs");
app.use(fileUpload());

//Controladores
const inicio = require('./controllers/inicio.js')
const registrarse = require('./controllers/registrarse.js')
const logearse = require('./controllers/logearse.js')
const User = require("./model/user");
const QRCode = require("./model/qrCode");
const ConnectedDevice = require('./model/connectedDevice')
const logoutController = require('./controllers/logout')
const UsuariosController = require('./controllers/usuarios.js')
const PdfPrinter = require("pdfmake")
const credencial = require ('./controllers/credencial.js');
const fs = require("fs")
const fonts = require("./pdf/fonts")
const styles = require("./pdf/styles")
const pdfDescargar = require('./controllers/descargar.js');
const inicioLogin =require('./controllers/inicioLogin.js')
const transacciones =require('./controllers/transacciones.js')
const eliminar = require('./controllers/eliminar.js')
const pendientes = require('./controllers/pendientes.js')
const perfil = require('./controllers/perfil.js')
const ticket = require('./controllers/ticket.js')
app.use(expressSession({
    secret: 'keyboard cat'
    }))


global.loggedIn = null;
global.role = null;

app.use("*", (req, res, next) => {

loggedIn = req.session.userId;
role= req.session.role;

next()
});
app.get('/',inicio)
app.get('/registrarse',registrarse)
app.get('/logearse',logearse)
app.get('/auth/logout', logoutController)
app.get('/usuarios', UsuariosController)
app.get('/credencial', credencial)
app.get('/inicioLogin',inicioLogin)
app.get('/transacciones',transacciones)
app.get('/perfil',perfil)
app.get('/ticket',ticket)


app.get('/pendientes',pendientes)

app.use('/pdfDescargar', pdfDescargar )
app.use('/eliminar', eliminar )


app.post("/register", async (req, res) => {
   

    try {
        const { first_name, last_name, email, password } = req.body;
    
        if (!(email && password && first_name && last_name)) {
          res.send(`<script>alert("¡Completa todos los campos!")
          window.location.href='/registrarse';
          </script>`);
       
        }
    
  
        const oldUser = await User.findOne({ email });

        if (oldUser) {


         res.send(`<script>alert("¡Este usuario ya existe!")
          window.location.href='/registrarse';
          </script>`);



        }



if(oldUser === null){

        encryptedPassword = await bcrypt.hash(password, 10);
    
        const user = await User.create({
          first_name,
          last_name,
          email: email.toLowerCase(), 
          password: password.toLowerCase(),
        });
    
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        
        //res.status(201).json({ token });
        res.send(`<script>alert("¡Usuario registrado con exito!")
        window.location.href='/';
        </script>`);

    }
      } catch (err) {
        res.redirect('/')
      }




    });



app.post("/login", async (req, res) => {


    try {
        // Get user input
        const { email, password } = req.body;
        console.log(email,password)
        // Validate user input
        if (!(email && password)) {
            res.send(`<script>alert("¡Completa todos los campos!")
            window.location.href='/logearse';
            </script>`);
        }
    
        // Validate if user exist in our database
        const user = await User.findOne({ email });
    if(user === null ){
      res.send(`<script>alert("¡Este usuario no existe!")
      window.location.href='/logearse';
      </script>`);

    }
    if(user.role !== "admin"){
      res.send(`<script>alert("¡No eres administrador!")
      window.location.href='/logearse';
      </script>`);

    }
        if (user.email === email && user.password === password) {
          req.session.role = user.role

            req.session.userId = user._id
          const token = jwt.sign(
            { user_id: user._id, email:user.email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
    
          // save user token
          user.token = token;
    
          // user
          return res.send(`<script>alert("¡Logeado con éxito!")
          window.location.href='/';
          </script>`);
        }
        res.send(`<script>alert("¡Credenciales invalidas!")
        window.location.href='/logearse';
        </script>`);} 
        catch (err) {
        console.log(err);
      }


    });

app.use("/login2", async(req,res)=>{

try {
  // Get user input
  //const { email, password } = req.body;
  const emailQuery = req.query.email
  const passwordQuery = req.query.password
  const email = emailQuery.toString()
  const password = passwordQuery.toString()
console.log(email)
console.log(password)

  // Validate user input
  if (!(email && password)) {
      res.send(`<script>alert("¡Completa todos los campos!")
      window.location.href='/logearse';
      </script>`);
  }

  // Validate if user exist in our database
  const user = await User.findOne({ email });

  if (user.email === email && user.password === password) {

      req.session.userId = user._id
    const token = jwt.sign(
      { user_id: user._id, email:user.email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    // save user token
    user.token = token;

    // user
    return res.send(`<script>alert("¡Logeado con éxito!")
    window.location.href='/transacciones';
    </script>`);
  }
  res.send(`<script>alert("¡Credenciales invalidas!")
  window.location.href='/logearse';
  </script>`);} 
  catch (err) {
  console.log(err);
}


})


//genera un link de acceso

    app.post("/qr/generate", async (req, res) => {

   const email = req.body.email
   const password = req.body.password
   const userid= req.body.userId
console.log(userid)


      
      QR.toFile(`./public/${userid}.png`, 'https://hackaton-himq.onrender.com/login2?email='+email+'&&password='+password, {
        errorCorrectionLevel: 'H'
      }, function(err) {
        if (err) throw err;
        console.log('QR code saved!');
        res.send(`<script>alert("¡Usuario dado de alta!")
        window.location.href='/usuarios';
        </script>`)
      });

      });




      app.use((req, res) => res.render('notfound'));

module.exports = app;

