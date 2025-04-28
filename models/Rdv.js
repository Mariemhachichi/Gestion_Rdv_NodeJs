const mongoose = require('mongoose')

const RdvSchema = new mongoose.Schema({
    date:{type:Date, required:true},
    professional:{type: mongoose.Schema.Types.ObjectId,ref :'User',required:true},
    client : {type : mongoose.Schema.Types.ObjectId, ref:'User',required:true},
    status:{type:String , enum:['en attente', 'confirmé', 'annulé'], default:'en attente'},
    description : String
})

module.exports = mongoose.model('Rdv',RdvSchema)