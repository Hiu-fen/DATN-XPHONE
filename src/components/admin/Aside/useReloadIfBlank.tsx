import { useEffect, useState } from 'react';

const useReloadIfBlank = () => {
  const [reloaded, setReloaded] = useState(false);

  useEffect(() => {
    const isBlank = document.body.innerHTML.trim().length === 0;

    if (isBlank && !reloaded) {
      setReloaded(true);
      window.location.reload(); // reload ngay lập tức
    }
  }, [reloaded]);
};

export default useReloadIfBlank;
