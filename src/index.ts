import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

require('dotenv').config();
const app = express();

const port = process.env.PORT || 80;
const statesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/states.json'), 'utf-8'));

// Middleware to validate state abbreviation
const validateState = (req: Request, res: Response, next: NextFunction): void => {
    if(!req.params.state){
      res.status(404).json({ error: 'State not found or invalid state abbreviation.' });
    }

    const stateAbbreviation = req.params.state.toUpperCase(); // Convert to uppercase to match the code format
    const state = statesData.find((state: { code: string }) => state.code === stateAbbreviation);
  
    if (!state) {
      res.status(404).json({ error: 'State not found or invalid state abbreviation.' });
    }

    console.log(state)
  
    // If state is valid, continue
    next();
  };

app.get('/states/:state{/:property}', validateState, (req: Request, res: Response) => {
    const { state, property } = req.params;
    const { contig } = req.query;

    let contigValue: boolean | undefined;

    if (contig === 'true') {
        contigValue = true;
    } else if (contig === 'false') {
        contigValue = false;
    }

    res.send(`State: ${state} ${property} ${contig}`);
  });


app.listen(port, () => {
     // TODO -- need default page?
});
  