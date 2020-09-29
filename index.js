/* eslint-disable no-await-in-loop */
const fs = require('fs');
const cron = require('node-cron');
const ftp = require('basic-ftp');
const csv = require('csvtojson');
const crypto = require('./crypto');

async function example() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: '64.31.33.10',
      user: 'kapi',
      password: 'senhatopdelinha',
      secure: false,
    });
    const list = await client.list('./docs');

    for (const arquivo of list) {
      try {
        console.log('verificando se arquivo existe');
        if (fs.existsSync(`./json/${arquivo.name.replace('.csv', '.json')}`)) {
          console.log('nenhum arquivo para ser processado');
          continue;
        }
      } catch (err) {
        console.error(err);
      }

      await client.cd('./docs');
      await client.downloadTo(`./temp/${arquivo.name}`, arquivo.name);

      const csvFilePath = `./temp/${arquivo.name}`;
      csv()
        .fromFile(csvFilePath)
        .then((jsonObj) => {
          const json = JSON.stringify(jsonObj, null, 4);

          const crypt = crypto(json, '0123456789ABCDEFFEDCBA987654321089ABCDEF01234567');

          fs.writeFile(`./json/${arquivo.name.replace('.csv', '.json')}`, crypt, (err) => console.log(err));
          fs.unlink(csvFilePath, (err) => console.log(err));
          //   console.log(JSON.stringify(jsonObj));
        });
    }

    console.log(list);
  } catch (err) {
    console.log(err);
  }
  client.close();
}

const task = cron.schedule('*/10 * * * * *', () => {
  example();
  console.log('é noix!');
});

task.start();
