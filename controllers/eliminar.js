const User = require("../model/user");

module.exports = async (req, res) =>{
 

    const idUsuario = req.query.usuarioId
await User.deleteOne({_id:idUsuario})

res.redirect('/usuarios')


}

