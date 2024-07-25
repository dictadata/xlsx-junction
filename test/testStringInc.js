
function lteCol(col1, col2) {
  console.log(col1.length < col2.length || (col1.length === col2.length && col1 <= col2));
}


lteCol("B", "C");
lteCol("C", "C");
lteCol("D", "C");
lteCol("AD", "C");

console.log("");

lteCol("A", "AC");
lteCol("D", "AC");
lteCol("AA", "AC");
lteCol("AC", "AC");
lteCol("AD", "AC");
lteCol("BB", "AC");

console.log("");

function incCol(col) {
  const A = 65;
  const Z = 90;

  let chars = Array.from(col);

  let rollover = false;
  let i = chars.length - 1;
  while (i >= 0) {
    let c = chars[ i ].charCodeAt(0);
    c++;
    if (c <= Z) {
      chars[ i ] = String.fromCharCode(c);
      rollover = false;
      break;
    }
    else {
      chars[ i ] = 'A';
      rollover = true;
    }
    --i;
  }

  if (rollover)
    chars.push('A');
  return chars.join("");
}

console.log(incCol("A"));
console.log(incCol("M"));
console.log(incCol("Z"));
console.log(incCol("AA"));
console.log(incCol("AM"));
console.log(incCol("AZ"));
console.log(incCol("MZ"));
console.log(incCol("ZZ"));
