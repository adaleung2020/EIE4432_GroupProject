import fs from 'fs/promises';
import client from './dbclient.js';
import express from 'express';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

const app = express();

const events = client.db('projectdb').collection('events');
const gridFSBucket = new GridFSBucket(client.db('projectdb'));

async function addEvent(name, id, type, price, date, time, venue, description, profileImage) {
  try {
    const data = await events.updateOne(
      { name },
      {
        $set: {
          id,
          type,
          price,
          date,
          time,
          venue,
          description,
        },
      },
      { upsert: true }
    );

    if (data.upsertedCount === 1) {
      console.log('Added 1 event');
    } else {
      console.log('Added 0 event');
    }
    if (profileImage) {
      const readableStream = Readable.from(profileImage.buffer);
      const uploadStream = gridFSBucket.openUploadStream(name);
      readableStream.pipe(uploadStream);
      const fileId = uploadStream.id;
      await events.updateOne({ name }, { $set: { profileImageId: fileId } });
    }
    return true;
  } catch (error) {
    console.error('Unable to update the database!');
    return false;
  }
}

async function selectingSeat(id, selectedseat) {
  try {
    const data = await events.updateOne(
      { id },
      {
        $set: {
          selectedseat,
        },
      },
      { upsert: true }
    );

    if (data.upsertedCount === 1) {
      console.log('Added selected seat');
    } else {
      console.log('No selected seat added');
    }
    return true;
  } catch (error) {
    console.error('Unable to update the database!');
    return false;
  }
}

async function fetch_eventDetail(id) {
  try {
    const eventDetail = await events.findOne({ id });
    return eventDetail;
  } catch (error) {
    console.log('Unable to fetch from database!');
    return null;
  }
}

async function fetch_allEvents() {
  try {
    const allEvents = await events.find({}).toArray();
    return allEvents;
  } catch (error) {
    console.log('Unable to fetch from database!');
    return null;
  }
}

export { addEvent, selectingSeat, fetch_eventDetail, fetch_allEvents };
