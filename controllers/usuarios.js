const User = require("../model/user");

module.exports = async (req, res) =>{
    const usuarios = await User.find({});
res.render('usuarios',{usuarios})
    }
    