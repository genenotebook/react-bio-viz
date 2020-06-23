import React from 'react';

type SequenceEntry = {
  header: string,
  seq: string
}

interface MSAProps {
  msa: SequenceEntry[],
  width?: number
}

export default function MultipleSequenceAlignment({
  msa, width = 500
}: MSAProps) {
  return (
    <div>
      <canvas width={width} />
    </div>
  )
}