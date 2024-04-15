function splitAddress(address) {
  let result = {
    col: "",
    row: ""
  }
  let rx = address.match(/([A-X]*)([0-9]*)/)
  result.col = rx[ 1 ];
  result.row = rx[ 2 ];
  return result;
}

let a;
a = splitAddress("A1");
console.log(JSON.stringify(a));
a = splitAddress("MM2023");
console.log(JSON.stringify(a));
