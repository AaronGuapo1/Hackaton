//const {content} = require("../pdf/pdfContent")
const download = require("download")

module.exports = async (req, res) =>{
 

    const idUsuario = req.query.usuarioid


    res.download('pdfs/'+idUsuario+'.pdf');


}

