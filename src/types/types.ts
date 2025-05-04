import { Request } from 'express';

export interface State {
  code: string;
  name: string;
}

export interface StateRequest extends Request {
  stateData?: State;
  contig?: boolean;
  prop?: string;
  index?: string;
}