import React from 'react';

export default function Repository({ match }) {
  const repository = decodeURIComponent(match.params.repository);
  return (
    <div>
      <h1>Repository: {repository} </h1> ;
    </div>
  );
}
