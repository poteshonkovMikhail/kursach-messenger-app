export const getRandomRainbowColor = (seed?: string) => {
    const colors = [
      'bg-red-500',    // Красный
      'bg-orange-500', // Оранжевый
      'bg-yellow-500', // Желтый
      'bg-green-500',  // Зеленый
      'bg-blue-500',   // Голубой
      'bg-indigo-500', // Синий
      'bg-purple-500', // Фиолетовый
    ];
    
    if (seed) {
      const charCode = seed.charCodeAt(0) || 0;
      return colors[charCode % colors.length];
    }
    
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  export const createAvatar = (username?: string) => {
    const color = getRandomRainbowColor(username);
    const letter = username?.charAt(0).toUpperCase() || '?';
    return { color, letter };
  };