const mongoose = require('mongoose');
const connect = async () =>{
    try{
        await mongoose.connect('mongodb+srv://ducquan:Quan16112002@cluster0.iliifpd.mongodb.net/data_science');
        console.log('connect successully')
    }catch(error){
        console.log('connect failure: '+error)
    }
}
module.exports = connect