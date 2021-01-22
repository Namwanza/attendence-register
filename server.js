const express = require('express');
const bodyParser = require('body-parser');
const macaddress = require('macaddress');
const myData = require('firebase');
const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const date = require('date-and-time');
const app = express();
const cors = require('cors');
const path = require('path');
app.use(cors({ origin: true }));
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Handles any requests that don't match the ones above
app.get('*', (req, res) =>{
     res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

if(process.env.NODE_ENV === 'production'){
    const path  =  require('path');
    app.get('/*',(req, res)=>{
        res.sendFile(path.resolve(__dirname+'/client/build/index.html'))
    })
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

myData.initializeApp(firebaseConfig);

const db =  myData.firestore();

app.get('/api/reg', (req, res) => {
   (async () => {
      try {
        macaddress.one((err, mac) => {
         db.collection('clockIn').where('uid', '==', mac).limit(1).get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              console.log('mac address', ':', doc.id, 'exists');
              console.log('Name', '=>', doc.data().name);
            });

            console.log(res.json(doc.data()))
            return res.status(200).send(doc.data());
          })
          .catch((err) => {
            console.log('Error getting documents', err);
          }); 
        });
      } catch (error) {
          console.log(error);
          return res.status(500).send(error);
      }
    })();






  // macaddress.one((err, mac) => {
  //   myData.firestore().collection('clockIn').where('uid', '==', mac).limit(1).get()
  //   .then((snapshot) => {
  //     snapshot.forEach((doc) => {
  //       console.log('mac address', ':', doc.id, 'exists');
  //       console.log('Name', '=>', doc.data().name);
  //       let dat = doc.data().name;
  //       res.send({ express: 'mac addresses: ', dat})
  //     });
  //   })
  //   .catch((err) => {
  //     console.log('Error getting documents', err);
  //   }); 

  //   if (mac) {
  //     console.log( 'mac addresses: ', mac )
  //   } else {
  //     console.log( 'mac addresses is not valid ' )
  //   }  
  // });

  // res.send({ express: 'Hello From Express' });
});

app.post('/api/mac', (req, res) => {
  console.log(req.body.clockIn);

  console.log(req.body)
  console.log(process.env)
  
  if (req.body.clockIn) {
    macaddress.one((err, mac) => {
      if (mac) {
        console.log('mac addresses: ', mac);
        console.log('The user clicked the button');
        console.log(req.body)
        console.log('mac addresses: ', mac);
        db.collection('clockIn').where('uid', '==', mac).limit(1).get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              console.log('mac address', ':', doc.id, 'exists');
              console.log('Name', '=>', doc.data().name);
            });

            console.log(res.json(doc.data()))
            res.status(200).send(doc.data());
          })
          .catch((err) => {
            console.log('Error getting documents', err);
          }); 
      } else {
        console.log('mac addresses is not valid ')
      }  
    });
  } else {
    console.log('No button click!')
  }
  res.send(
    `
      I received your POST request. 
      This is what you sent me: ${req.body.clockIn}
    `,
  );

  if (req.body.clockIn) {
    let transporter = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: 'testing@gmail.com',
        pass: '&&a'
      }
    }));

    const now = new Date();

    let mailOptions = {
      from: 'r.namwanza@skyllaconnect.com',
      to: 'namwanzaronald4@gmail.com',
      subject: "Today's Attendence Register",
      text: "Teacher's Name: " + ' ' + `${}` + `\r\n` + 
          'Day of the week: ' + ' ' + `${date.format(now, 'dddd')}` + `\r\n` + 
          'Date: ' + ' ' + `${date.format(now, 'DD-MM-YYYY')}` + `\r\n` +
          'Time of Arrival: ' + ' ' +  `${date.format(now, 'HH:mm')}`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    }); 
  } else {
    console.log('Send clock out');
    return null
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));