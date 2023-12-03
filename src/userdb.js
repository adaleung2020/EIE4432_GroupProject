import fs from 'fs/promises';
import client from './dbclient.js';
import express from 'express';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

const app = express();

const users = client.db('projectdb').collection('users');
const gridFSBucket = new GridFSBucket(client.db('projectdb'));

async function init_db() {
  try {
    const users = client.db('projectdb').collection('users');
    const count = await users.countDocuments();
    if (count === 0) {
      const data = await fs.readFile('./users.json', 'utf-8');
      const usersData = JSON.parse(data);
      const result = await users.insertMany(usersData);
      console.log(`Added ${result.insertedCount} users`);
    }
  } catch (err) {
    console.error('Unable to initialize the database!');
  }
}
init_db().catch(console.dir);

//validate
async function validate_user(username, password) {
  try {
    if (!username || !password) {
      return false;
    }

    const user = await users.findOne({ username, password });

    if (user) {
      return {
        username: user.username,
        password: user.password,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        birth: user.birth,
        role: user.role,
      };
    } else {
      return false;
    }
  } catch (error) {
    console.log('Unable to fetch from database!');
    return false;
  }
}

async function resetpassword(username, password) {
  try {
    const data = await users.updateOne(
      { username },
      {
        $set: {
          password,
        },
      },
      { upsert: false }
    );

    if (data) {
      console.log('Updated 1 user');
    } else {
      console.log('Updatec 0 user');
    }
    return true;
  } catch (error) {
    console.error('Unable to update the database!');
    return false;
  }
}

async function update_user(username, password, email, phone, gender, birth, role, profileImage) {
  try {
    const data = await users.updateOne(
      { username },
      {
        $set: {
          password,
          email,
          phone,
          gender,
          birth,
          role,
        },
      },
      { upsert: true }
    );

    if (data.upsertedCount === 1) {
      console.log('Added 1 user');
    } else {
      console.log('Added 0 user');
    }
    if (profileImage) {
      const readableStream = Readable.from(profileImage.buffer);
      const uploadStream = gridFSBucket.openUploadStream(username);
      readableStream.pipe(uploadStream);
      const fileId = uploadStream.id;
      await users.updateOne({ username }, { $set: { profileImageId: fileId } });
    }
    return true;
  } catch (error) {
    console.error('Unable to update the database!');
    return false;
  }
}

async function fetch_user(username) {
  try {
    const user = await users.findOne({ username:username });
    return user;
  } catch (error) {
    console.log('Unable to fetch from database!');
    return null;
  }
}

async function username_exist(username) {
  try {
    const result = await fetch_user(username);

    if (result === null) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log('Unable to fetch from database!');
    return false;
  }
}

async function sha256(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export { validate_user, update_user, fetch_user, username_exist, sha256, resetpassword, gridFSBucket };
