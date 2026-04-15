export const formatPriceVND = (price) => {
  if (price === null || price === undefined) return '0K';
  let num = Number(price);
  if (isNaN(num)) return '0K';
  
  if (num < 1000) {
    num = num * 10000;
  }
  
  return (num / 1000).toLocaleString('vi-VN') + 'K';
};
