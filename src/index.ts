import express from 'express';
import cors from 'cors';  
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction, Application } from 'express';
import { State, StateRequest } from './types/types';
import { connectToDatabase } from './db/mongoose';
import {
  getAllStates,
  getStateProperty,
  getState,
  postState,
  patchState,
  deleteState,
} from './controllers/stateController';
require('dotenv').config();

const app: Application = express();
const port = process.env.PORT || 80;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
const statesData: State[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/states.json'), 'utf-8'));

// Middleware to validate state abbreviation
const validateState = (req: StateRequest, res: Response, next: NextFunction): void => {
  if (!req.params.state) {
    return next();
  }

  const stateAbbreviation = req.params.state.toUpperCase();
  const state = statesData.find((s) => s.code === stateAbbreviation);

  if (!state) {
    res.status(404).json({ message: 'Invalid state abbreviation parameter' });
    return next();
  }

  if(req.params.prop){
    req.prop = req.params.prop;
  }

  req.stateData = state;
  next();
};

// Route that delegates to controller methods
app.all('/states{/:state}{/:prop}', validateState, (req: StateRequest, res: Response) => {
  if(res.headersSent){
    return;
  }
  switch (req.method) {
    case 'GET':
      if(!req.stateData){
         getAllStates(req, res);
         return;
      }
      if(req.prop){
         getStateProperty(req, res);
         return;
      }
       getState(req, res);
       return;
    case 'POST':
       postState(req, res);
       return;
    case 'PATCH':
       patchState(req, res);
       return;
    case 'DELETE':
       deleteState(req, res);
       return;
    default:
      res.status(405).send('Method Not Allowed');
      return;
  }
});

// Catch all other routes
app.use((req: Request, res: Response) => {
  const accept = req.headers.accept || '';
  if (accept.includes('*/*') || accept.includes('text/html')) {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (accept.includes('application/json')) {
    res.status(404).json({ error: '404 Not Found' });
  } else {
    res.status(404).type('text').send('404 Not Found');
  }
});

(async () => {
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();