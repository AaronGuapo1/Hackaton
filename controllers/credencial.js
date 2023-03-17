const PdfPrinter = require("pdfmake")
const fs = require("fs")
const fonts = require("../pdf/fonts")
const styles = require("../pdf/styles")

module.exports = async (req, res) =>{

const userid=req.query.usuarioId


    var docDefinition = {
        content: [{text:"Credencial del alumno", style:"header",alignment: 'center'},
 
        {
            text: ' ',
        },
            {
                image: './public/img/Credencial1.png',
            },
            {
                text: ' ',
            },
            {
                image: './public/img/Credencial2.png',
            },
            {
                text: ' ',
            },
            {
                image: './public/'+userid+'.png',
                width: 80,
                height: 80,
            }




        ]
    }

       const printer = new PdfPrinter(fonts);
   
       let pdfDoc = printer.createPdfKitDocument(docDefinition);
       pdfDoc.pipe(fs.createWriteStream('pdfs/'+userid+'.pdf'));
       pdfDoc.end();
   

       res.render('credencial',{userid})


}