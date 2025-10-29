import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LottieProps {
  className?: string;
}

const Lottie = ({ className = 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-96 lg:h-96' }: LottieProps) => {
  return (
    <div className={className}>
      <DotLottieReact
        src="https://lottie.host/ef9a14ec-3c36-456c-9c22-f05fe0ba827c/34QdMTY8ow.lottie"
        loop
        autoplay
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Lottie;
