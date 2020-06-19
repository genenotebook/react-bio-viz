import React from 'react';

import { GeneModel } from '../src/index'

import gene from './data/genemodel.json'

export default function App(): JSX.Element {
  return (
    <div className='container'>
      <GeneModel gene={gene} />
    </div>
  )
}