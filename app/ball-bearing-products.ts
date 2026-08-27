export const ballBearingProducts = [
  ["6000","Deep Groove Ball Bearings",10,26,8],["6200","Deep Groove Ball Bearings",10,30,9],["6300","Deep Groove Ball Bearings",10,35,11],["6403","Deep Groove Ball Bearings",17,62,17],
  ["6800","Thin Section Ball Bearings",10,19,5],["6900","Thin Section Ball Bearings",10,22,6],["16001","Extra Thin Section Ball Bearings",12,28,7],["608","Miniature Ball Bearings",8,22,7],
  ["4200","Double Row Deep Groove Ball Bearings",10,30,14],["4300","Double Row Deep Groove Ball Bearings",10,35,17],["7000","Single Row Angular Contact Ball Bearings",10,26,8],["7200","Single Row Angular Contact Ball Bearings",10,30,9],
  ["7300","Single Row Angular Contact Ball Bearings",10,35,11],["7403","Single Row Angular Contact Ball Bearings",17,62,17],["3200","Double Row Angular Contact Ball Bearings",10,30,14],["3300","Double Row Angular Contact Ball Bearings",10,35,17],
  ["1200","Self-Aligning Ball Bearings",10,30,9],["1300","Self-Aligning Ball Bearings",10,35,11],["2200","Self-Aligning Ball Bearings",10,30,14],["2300","Self-Aligning Ball Bearings",10,35,17],
  ["51100","Single Direction Thrust Ball Bearings",10,24,9],["51200","Single Direction Thrust Ball Bearings",10,26,11],["51300","Single Direction Thrust Ball Bearings",10,26,11],["51400","Single Direction Thrust Ball Bearings",10,26,11],
] as const;

export function getBallBearingProduct(number: string) { return ballBearingProducts.find(([bearingNumber]) => bearingNumber === number); }
