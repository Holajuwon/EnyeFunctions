const functions = require("firebase-functions");
const cors = require("cors");
const admin = require("firebase-admin");
const express = require("express");
const uuidv5 = require("uuid5");

admin.initializeApp();
const database = admin.database().ref("/users");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/", (req, res) => {
  const users = req.body;
  return database
    .push(users)
    .then(() => res.status(200).send(users))
    .catch(err => {
      console.error(err);
      return res.status(500).send("failed");
    });
});

app.get("/", (req, res) => {
  return database.on(
    "value",
    snapshot => {
      return res.status(200).send(Object.values(snapshot.val()));
    },
    error => {
      res.status(error.code).json({
        message: `Something went wrong. ${error.message}`
      });
    }
  );
});

exports.usersData = functions.https.onRequest(app);

exports.addUserId = functions.database
  .ref("/users/{usersId}")
  .onCreate((snapshot, context) => {
    const pushId = context.params.usersId;
    const uuid = uuidv5(
      `https://update-table-b7e83.firebaseapp.com/${pushId}`,
      uuidv5.URL
    );

    return snapshot.ref.update({ userId: uuid });
  });
