let code = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "z",
    "x",
    "c",
    "v",
    "b",
    "n",
    "m",
    "a",
    "s",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "p",
    "o",
    "i",
    "u",
    "y",
    "t",
    "r",
    "e",
    "w",
    "q",
    "Z", "X", "C", "V", "B", "N", "M", "L", "K", "J", "H", "G", "F", "D", "S", "A", "P", "O", "I", "U", "Y", "T", "R", "E", "W", "Q"
];


exports.captcha = function(){
    let arr = code;
    let str = '';
    for (let index = 0; index < 4;index++) {
        let panum = Math.floor(Math.random() * (62 - 0) + 0);
        let strin = arr[panum];
        str += strin;
    }
    return str;
}