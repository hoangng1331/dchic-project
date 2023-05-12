const fs = require ('fs');
function write (SaveFile, data) {
    fs.writeFileSync(SaveFile, JSON.stringify(data), function(err){
        if (err) throw err});
}
module.exports = {write};