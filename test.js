const ob = {
  t: [],
};

const t = [
  {
    a: 1,
    b: 2,
  },
  {
    a: 3,
    b: 4,
  },
  {
    a: 5,
    b: 6,
  },
]
console.log(ob.t);

ob.t = t;

console.log(ob.t);
