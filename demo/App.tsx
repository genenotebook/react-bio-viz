import React from 'react';

import { GeneModel, MultipleSequenceAlignment } from '../src/index'

import gene from './data/genemodel.json'
import msa from './data/multiple_sequence_alignment.json'

export default function App(): JSX.Element {
  return (
    <div className='container'>
      <GeneModel gene={gene} />
      <MultipleSequenceAlignment msa={msa} />
    </div>
  )
}