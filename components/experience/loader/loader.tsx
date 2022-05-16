import { Html, useProgress } from '@react-three/drei';
import React from 'react';

export const Loader: React.FC = () => {
  const { progress } = useProgress();
  return <div>{progress} % loaded</div>;
};
