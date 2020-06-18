import React from 'react';

import { GeneModel } from '../src/index'

import data from './data/genemodel.json'

export default function App(): JSX.Element {
  return (
    <div className='container'>
      <GeneModel ID='test-gene' data={data} />
    </div>
  )
}