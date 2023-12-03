import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { ObjectId } from 'mongodb';
const users = new Map();
const EventId = null;
const app = express();
import {
  validate_user,
  update_user,
  fetch_user,
  username_exist,
  sha256,
  resetpassword,
  gridFSBucket,
} from './userdb.js';
import { addEvent, selectingSeat, fetch_eventDetail, fetch_allEvents } from './event.js';

// Function to populate users from users.json
async function init_userdb() {
  console.log(users);
  if (users.size > 0) return;

  try {
    const userData = await fs.readFile('./', 'utf-8');
    const usersArray = JSON.parse(userData);

    usersArray.forEach((user) => {
      users.set(user.username, user);
    });
    console.log(users);
  } catch (error) {
    console.error('Error reading users.json:', error);
  }
}

const route = express.Router();
const form = multer();

route.use(express.urlencoded({ extended: true }));
route.use(express.json());

// POST /login request handler
route.post('/login', form.none(), async (req, res) => {
  // if (users.size === 0) {
  //   await init_userdb();
  // }
  req.session.logged = false;

  console.log(req.body);

  const hashpassword = await sha256(req.body?.password);

  const user = await validate_user(req.body?.username, hashpassword);

  if (!user) {
    res.status(401).json({ status: 'failed', message: 'Incorrect username and password' });
  } else {
    // User is valid and enabled
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.logged = true;

    res.json({
      status: 'success',
      user: {
        username: user.username,
        role: user.role,
      },
    });
  }
});

// POST /logout request handler
route.post('/logout', (req, res) => {
  if (req.session.logged) {
    req.session.destroy(); // Invalidate current session
    res.end(); // Send empty response
  } else {
    res.status(401).json({ status: 'failed', message: 'Unauthorized' });
  }
});

// GET /me request handler
route.get('/me', (req, res) => {
  if (req.session.logged) {
    const user = users.get(req.session.username);
    res.json({
      status: 'success',
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } else {
    res.status(401).json({ status: 'failed', message: 'Unauthorized' });
  }
});

route.post('/register', form.single('profileImage'), async (req, res) => {
  try {
    // Call init_userdb() if the in-memory user database, users, is empty
    if (users.size === 0) {
      await init_userdb();
    }

    // Check if both "username" and "password" are not empty
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ status: 'failed', message: 'Missing fields' });
    }

    const { username, password, email, phone, gender, birth, role } = req.body;

    // Check if the username is at least 3 characters
    if (username.length < 3) {
      return res.status(400).json({ status: 'failed', message: 'Username must be at least 3 characters' });
    }

    // Check if the username already exists
    if (users.has(username)) {
      return res.status(400).json({ status: 'failed', message: `Username ${username} already exists` });
    }

    // Check if the password is at least 8 characters
    if (password.length < 8) {
      return res.status(400).json({ status: 'failed', message: 'Password must be at least 8 characters' });
    }

    // Call the update_user() function to insert a new user

    const hashpassword = await sha256(password);

    console.log(hashpassword);

    const result = await update_user(username, hashpassword, email, phone, gender, birth, role, req.file);

    if (result) {
      return res.status(200).json({ status: 'success', user: { username } });
    } else {
      return res
        .status(500)
        .json({ status: 'failed', message: 'Account created but unable to save into the database' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

// POST /forgot-password request handler
route.post('/reset-password', form.none(), async (req, res) => {
  try {
    const username = req.body?.username;
    const newPassword = req.body?.newPassword;

    if (!username || !newPassword) {
      return res.status(400).json({ status: 'failed', message: 'Username and new password cannot be empty' });
    }

    const hashedNewPassword = await sha256(newPassword);

    const user = await username_exist(username);
    if (!user) {
      return res.status(404).json({ status: 'failed', message: 'User not found' });
    }

    await resetpassword(username, hashedNewPassword);

    return res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error during password update:', error);
    return res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

//POST/add event
route.post('/addevent', form.single('profileImage'), async (req, res) => {
  try {
    const { name, id, type, price, date, time, venue, description } = req.body;
    const result = await addEvent(name, id, type, price, date, time, venue, description, req.file);
    if (result) {
      return res.status(200).json({ status: 'success', user: { name } });
    } else {
      return res.status(500).json({ status: 'failed', message: 'Event created but unable to save into the database' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

route.get(`/event/:eventId`, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    console.log(eventId);
    const eventDetail = await fetch_eventDetail(eventId);
    console.log(eventDetail);
    res.json(eventDetail);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

route.get(`/seatManagement/:eventId`, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    console.log(eventId);
    const eventDetail = await fetch_eventDetail(eventId);
    console.log(eventDetail);
    res.json(eventDetail);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

route.get('/displayevents', async (req, res) => {
  try {
    const allEvents = await fetch_allEvents();
    res.json(allEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

route.get('/eventsimg/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await fetch_eventDetail(eventId);
    if (event && event.profileImageId !== null && event.profileImageId !== undefined) {
      try {
        // Retrieve the image from GridFS using the profileImageId
        const imageStream = gridFSBucket.openDownloadStream(new ObjectId(event.profileImageId)); // Fix: use 'new'
        const chunks = [];

        imageStream.on('data', (chunk) => {
          chunks.push(chunk);
        });

        imageStream.on('end', () => {
          // Concatenate the chunks into a Buffer
          const buffer = Buffer.concat(chunks);
          // Convert the Buffer to base64
          const base64Image = buffer.toString('base64');

          // Add the base64Image to the user object
          event.profileImage = base64Image;
          // Send the user data with the profileImage field to the client
          res.json(event);
        });
      } catch (error) {
        console.error('Error fetching image from GridFS:', error);
        res.status(500).json({
          status: 'failed',
          message: 'Error fetching image from GridFS',
        });
      }
    } else {
      res.status(500).json({
        status: 'failed',
      });
    }
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: 'event image not found',
    });
  }
});

route.post('/selectedSeat', form.none(), async (req, res) => {
  try {
    const { eventId, bookingStatus } = req.body;
    // const pastSelected = await fetch_selectedSeat(eventId);
    // console.log(pastSelected);
    const result = await selectingSeat(eventId, bookingStatus);
    if (result) {
      return res.status(200).json({ status: 'success' });
    } else {
      return res.status(500).json({ status: 'failed', message: 'Event created but unable to save into the database' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

route.get(`/userDetail/:logineduser`, async (req, res) => {
  try {
    const logineduser = req.params.logineduser;
    const UserDetail = await fetch_user(logineduser);

    if (UserDetail && UserDetail.profileImageId !== null && UserDetail.profileImageId !== undefined) {
      try {
        // Retrieve the image from GridFS using the profileImageId
        const imageStream = gridFSBucket.openDownloadStream(new ObjectId(UserDetail.profileImageId)); // Fix: use 'new'
        const chunks = [];

        imageStream.on('data', (chunk) => {
          chunks.push(chunk);
        });

        imageStream.on('end', () => {
          // Concatenate the chunks into a Buffer
          const buffer = Buffer.concat(chunks);
          // Convert the Buffer to base64
          const base64Image = buffer.toString('base64');

          // Add the base64Image to the user object
          UserDetail.profileImage = base64Image;
          // Send the user data with the profileImage field to the client
          res.json(UserDetail);
        });
      } catch (error) {
        console.error('Error fetching image from GridFS:', error);
        res.status(500).json({
          status: 'failed',
          message: 'Error fetching image from GridFS',
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'failed', message: 'Internal server error' });
  }
});

//insertOne/findOne -> register new ac to mongo
export default route;
