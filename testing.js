let txt = "GeeksForGeeks",
  pat = "For";

function contain(tex, pat) {
  return txt.indexOf(pat);
}

console.log(contain(txt, pat));
