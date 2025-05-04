import { Response } from 'express';
import State from '../models/state';
import statesData from '../data/states.json';
import { StateRequest } from '../types/types';

export const getState = async (req: StateRequest, res: Response) => {
  const state = req.stateData!;
  const doc = await State.findOne({ stateCode: state.code }).exec();
  const funfacts = doc?.funfacts || [];
  const responseData: Record<string, any> = { ...state };

  if (doc?.funfacts && doc.funfacts.length > 0) {
    responseData.funfacts = doc.funfacts;
  }

  return res.status(200).json(responseData);
};

export const postState = async (req: StateRequest, res: Response) => {
  const state = req.stateData!;
  const { funfacts } = req.body;

  if (!Array.isArray(funfacts) || funfacts.length === 0) {
    return res.status(400).json({ error: 'Funfacts must be a non-empty array.' });
  }

  try {
    const existingState = await State.findOne({ stateCode: state.code }).exec();

    if (existingState) {
      existingState.funfacts.push(...funfacts);
      await existingState.save();
      return res.json({
        ...state,
        funfacts: existingState.funfacts
      });
    } else {
      return res.status(404).json({error: 'state not found'});
    }
  } catch (err) {
    return res.status(500).json({ error: 'Database error', details: err });
  }
};


export const patchState = async (req: StateRequest, res: Response) => {
    const state = req.stateData!;
    const { index, funfact } = req.body;
  
    // Validate inputs
    if (!index || typeof index !== 'number' || index < 1) {
      return res.status(400).json({ error: 'Valid index is required and must be 1 or greater.' });
    }
  
    console.log(funfact)
    if (!funfact || typeof funfact !== 'string') {
      return res.status(400).json({ error: 'Funfact must be a non-empty string.' });
    }
  
    try {
      const existingState = await State.findOne({ stateCode: state.code }).exec();
  
      if (!existingState || !Array.isArray(existingState.funfacts)) {
        return res.status(404).json({ error: 'No fun facts found for this state.' });
      }
  
      const zeroBasedIndex = index - 1;
  
      if (zeroBasedIndex < 0 || zeroBasedIndex >= existingState.funfacts.length) {
        return res.status(400).json({ error: 'Index out of range.' });
      }
  
      existingState.funfacts[zeroBasedIndex] = funfact;
      await existingState.save();
  
      return res.json({
        ...state,
        funfacts: existingState.funfacts,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
};

export const deleteState = async (req: StateRequest, res: Response) => {
  const state = req.stateData!;
  const { index } = req.body;

  // Validate index
  if (!index || typeof index !== 'number' || index < 1) {
    return res.status(400).json({ error: 'Valid index is required and must be 1 or greater.' });
  }

  try {
    const existingState = await State.findOne({ stateCode: state.code }).exec();

    if (!existingState || !Array.isArray(existingState.funfacts)) {
      return res.status(404).json({ error: 'No fun facts found for this state.' });
    }

    const zeroBasedIndex = index - 1;

    if (zeroBasedIndex < 0 || zeroBasedIndex >= existingState.funfacts.length) {
      return res.status(400).json({ error: 'Index out of range.' });
    }

    // Remove funfact at the index
    existingState.funfacts.splice(zeroBasedIndex, 1);
    await existingState.save();

    return res.json({
      ...state,
      funfacts: existingState.funfacts
    });
  } catch (err) {
    return res.status(500).json({ error: 'Database error', details: err });
  }
};

export const getAllStates = async (req: StateRequest, res: Response) => {
  try {
    const dbStates = await State.find();
    const funfactsMap: Record<string, string[]> = {};
    const { contig } = req.query;
    const contigValue = contig === 'true' ? true : contig === 'false' ? false : undefined;

    dbStates.forEach(({ stateCode, funfacts }) => {
      if (funfacts?.length) {
        funfactsMap[stateCode] = funfacts;
      }
    });

    let fullStates = statesData.map(state => ({
      ...state,
      funfacts: funfactsMap[state.code] || []
    }));
  
    if (contigValue === true) {
      fullStates = fullStates.filter(s => s.code !== 'AK' && s.code !== 'HI');
    } else if (contigValue === false) {
      fullStates = fullStates.filter(s => s.code === 'AK' || s.code === 'HI');
    }

    res.json(fullStates);
  } catch (err) {
    console.error('Error fetching states:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getStateProperty = async (req: StateRequest, res: Response) => {
  try {
    const state = req.stateData!;
    const staticState = (statesData as any[]).find(s => s.code === state.code);
    const stateName = staticState.name;
    const property = req.prop?.toUpperCase();

    switch(property) {
      case 'FUNFACT':
        const doc = await State.findOne({ stateCode: state.code }).exec();
        const funfacts = doc?.funfacts || [];
        if (funfacts.length === 0) {
          return res
            .status(404)
            .json({ error: `No fun facts found for ${stateName}.` });
        }
        const randomFact = funfacts[
          Math.floor(Math.random() * funfacts.length)
        ];
        return res.json({
          funfact: randomFact
        });
        case 'CAPITAL':
          return res.status(200)
            .json({
              'state': staticState.state,
              'capital': staticState.capital_city
            });
        case 'NICKNAME':
          return res.status(200)
            .json({
              'state': staticState.state,
              'nickname': staticState.nickname
            });
        case 'POPULATION':
          return res.status(200)
            .json({
              'state': staticState.state,
              'population': staticState.population.toLocaleString('en-US')
            });
        case 'ADMISSION':
          return res.status(200)
            .json({
              'state': staticState.state,
              'admitted': staticState.admission_date
            });
      default:
        return res.status(405).send('Property not found');
    }

  } catch (err) {
    console.error('Error fetching states:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};