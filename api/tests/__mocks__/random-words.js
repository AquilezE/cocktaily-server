const generate = jest.fn((options) => {
  if (options && options.exactly) {
    return Array(options.exactly).fill("Palabra");
  }
  return ["Palabra1"];
});

module.exports = { generate };