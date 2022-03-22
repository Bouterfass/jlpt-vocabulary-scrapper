const isLetter = (char) => {
    return char.length === 1 && char.match(/[a-z|A-Z]/i);
}


module.exports = { isLetter };