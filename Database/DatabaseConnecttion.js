// const mongoose = require("mongoose");

// const url =
//   "mongodb://anas:123@localhost:3200/certifiedinspect?authSource=admin";

// mongoose
//   .connect(url)
//   .then(() => {
//     console.log("Connection Succesfully established");
//   })
//   .catch((err) => {
//     console.error(err);
//   });

// mongoose.connection.on("connected", () => {
//   console.log("Mongoose connected to MongoDB");
// });

// mongoose.connection.on("error", (err) => {
//   console.error(`Mongoose connection error: ${err}`);
// });

// mongoose.connection.on("disconnected", () => {
//   console.log("Mongoose disconnected from MongoDB");
// });

// module.exports = mongoose;


// const fs     = require('fs');
// const tunnel = require('tunnel-ssh');
// const mysql  = require('mysql2/promise');

// const sshConfig = {
  // host: '3.106.21.133', // your EC2 public DNS or IP
  // port: 22,
  // username: 'ubuntu',                             // or 'ubuntu', depending on your AMI
  // privateKey: fs.readFileSync('D:/certified-prod.pem'),
  // dstHost: '127.0.0.1',  // MySQL is listening on localhost of the EC2
  // dstPort: 3306,
  // localHost: '127.0.0.1',
  // localPort: 3306
// };

// tunnel(sshConfig)
//   .then(() => {
//     // Once the tunnel is up, connect as if MySQL were local:
//     const connectionUrl = 'mysql://inspect:01GvqiqjzD.U@127.0.0.1:3306/inspect';
//     return mysql.createConnection(connectionUrl);
//   })
//   .then(conn => {
//     console.log('✔️  Connected!');
//     // … use conn …
//   })
//   .catch(err => console.error('❌  Error:', err));


// const fs = require('fs');
// const tunnel = require('tunnel-ssh');
// const mysql = require('mysql2/promise');
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection:', reason);
// });

// const sshConfig = {
//   host: '3.106.21.133', // your EC2 public DNS or IP
//   // host: '3.106.21.133', // your EC2 public DNS or IP
//   port: 22,
//   username: 'ubuntu',                             // or 'ubuntu', depending on your AMI
//   privateKey: fs.readFileSync('../../certified-prod.pem',"utf-8"),
//   dstHost: '127.0.0.1',  // MySQL is listening on localhost of the EC2
//   dstPort: 3306,
//   localHost: '127.0.0.1',
//   localPort: 3306
// };

// tunnel.createTunnel(sshConfig, async (error, server) => {
//   if (error) {
//     console.error('❌ SSH tunnel error:', error);
//     return;
//   }

//   try {
//     const connection = await mysql.createConnection({
//       host: '127.0.0.1',
//       port: 3306,
//       user: 'inspect',
//       password: '01GvqiqjzD.U',
//       database: 'inspect'
//     });

//     console.log('✔️  Connected to MySQL via SSH tunnel!');
//     // use the connection here
//   } catch (err) {
//     console.error('❌ MySQL error:', err);
//   }
// });



// install with: npm install tunnel-ssh mysql2
// const fs     = require('fs');
// const tunnel = require('tunnel-ssh').default;
// const mysql  = require('mysql2/promise');

// async function connectViaSSHTunnel() {
//   // 1) configure the SSH tunnel:
//   const sshConfig = {
//     host: '3.106.21.133',                    // EC2 public IP
//     port: 22,                                // SSH port
//     username: 'ubuntu',                      // your EC2 user
//     privateKey: fs.readFileSync(
//       '../../certified-prod.pem', 
//       'utf8'
//     ),

//     // 2) where to forward to on the EC2 host:
//     dstHost: '127.0.0.1',  // MySQL listens on localhost in EC2
//     dstPort: 3306,

//     // 3) open a local port on your machine:
//     localHost: '127.0.0.1',
//     localPort: 3306       // pick a port that’s free on your PC
//   };

//   // establish the tunnel
//   await new Promise((resolve, reject) => 
//     tunnel(sshConfig, (err, server) => err ? reject(err) : resolve(server))
//   );

//   // 4) once the tunnel is live, connect as if MySQL were local:
//   //    – USER      = inspect
//   //    – PASSWORD  = <your-mysql-password>
//   //    – HOST/PORT = localhost:3307 (the tunnel)
//   //    – DB_NAME   = <your-database-name>
//   const connectionUrl = 
//     'mysql://inspect:01GvqiqjzD.U@127.0.0.1:3306/inspect';

//   const conn = await mysql.createConnection(connectionUrl);
//   console.log('✅  MySQL connected!');

//   // …use `conn` as usual…
//   return conn;
// }

// connectViaSSHTunnel().catch(err => console.error(err));


const mysql = require('mysql2/promise');
// require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'inspect_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
