let n = 5;
let string = "";
// External loop
for (let i = 1; i <= n; i++) {
  // creating spaces
  for (let j = 1; j < i; j++) {
    string += " ";
    }
    // if (i%2 == 0) {
    //     string += "*"
    // }
  // creating numbers
  for (let k = 1; k <= 2 * (n - i + 1) - 1; k++) {
      if (k += 1) {
          string += "#"
      } else {
          string += ""
      }
    string += "*";
    }
  string += "\n";
}
console.log(string);