// create a simple script that reads all files from this directory and ignores index.js itself and them renames so the name is a random uuid with the same extension as the original file and then log the list as a stringified json array with the names like this "/success/uuid.extension"
const fs = require('fs');
const path = require('path');
const randomUUID = require('crypto').randomUUID;
const uuidv4 = () => randomUUID();

const directoryPath = __dirname;

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    const renamedFiles = [];

    files.forEach((file) => {
        if (file === 'index.js') return;
        const fileExtension = path.extname(file);
        const newFileName = `${uuidv4()}${fileExtension}`;
        const oldFilePath = path.join(directoryPath, file);
        const newFilePath = path.join(directoryPath, newFileName);
        fs.renameSync(oldFilePath, newFilePath);
        renamedFiles.push(`/success/${newFileName}`);
    });

    console.log(JSON.stringify(renamedFiles, null, 2));
});