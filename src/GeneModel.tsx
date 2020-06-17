import * as React from 'react';

export interface GeneModelProps { ID: string }

export default function GeneModel({ ID }: GeneModelProps): JSX.Element {
    return (
        <div>
            <h5>GeneModel {ID}</h5>
            <svg />
        </div>
    )
}